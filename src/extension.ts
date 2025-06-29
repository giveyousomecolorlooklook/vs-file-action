import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// 定义处理器接口
interface ActionHandler {
  execute(uri: vscode.Uri, config: any): Promise<void>;
}

// 处理器注册表
class ActionHandlerRegistry {
  private handlers = new Map<string, ActionHandler>();

  register(type: string, handler: ActionHandler) {
    this.handlers.set(type, handler);
  }

  getHandler(type: string): ActionHandler | undefined {
    return this.handlers.get(type);
  }
}

// 创建处理器注册表实例
const registry = new ActionHandlerRegistry();

// 注册内置处理器
registry.register('vscode-command', {
  async execute(uri: vscode.Uri, config: { command: string }) {
    await vscode.commands.executeCommand(config.command);
  }
});

registry.register('shell-command', {
  async execute(uri: vscode.Uri, config: { commands: string[] }) {
    const extensionPath = vscode.extensions.getExtension('chentp0601.vs-file-action')?.extensionPath || '';
    const fileName = path.basename(uri.fsPath);

    // 支持多行命令
    const commands = (config.commands || []).map(cmd =>
      cmd
        .replace(/\$\{filePath\}/g, uri.fsPath)
        .replace(/\$\{fileDir\}/g, path.dirname(uri.fsPath))
        .replace(/\$\{fileName\}/g, fileName)
        .replace(/\$\{extensionPath\}/g, extensionPath)
    );

    let terminal = vscode.window.terminals.find(t => t.name === 'shell-command');
    if (!terminal) {
      terminal = vscode.window.createTerminal('shell-command');
    }
    for (const cmd of commands) {
      terminal.sendText(cmd);
    }
    terminal.show();
  }
});

registry.register('npm-script', {
  async execute(uri: vscode.Uri, config: { script: string }) {
    const extensionPath = vscode.extensions.getExtension('chentp0601.vs-file-action')?.extensionPath || '';
    const fileName = path.basename(uri.fsPath);
    const command = config.script
      .replace(/\$\{filePath\}/g, uri.fsPath)
      .replace(/\$\{fileDir\}/g, path.dirname(uri.fsPath))
      .replace(/\$\{fileName\}/g, fileName)
      .replace(/\$\{extensionPath\}/g, extensionPath);

    let terminal = vscode.window.terminals.find(t => t.name === 'NPM Script');
    if (!terminal) {
      terminal = vscode.window.createTerminal('NPM Script');
    }
    terminal.sendText(`npm run ${command}`);
    terminal.show();
  }
});

export function activate(context: vscode.ExtensionContext) {

	vscode.window.showInformationMessage('Congratulations, your extension "vs-file-action" is now active!');
  // 创建状态栏项
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(gear) File Actions";
  statusBarItem.tooltip = "Settings for File Actions";
  statusBarItem.command = 'vs-file-action.showStatusBarMenu';
  statusBarItem.show();
  
  // 注册状态栏菜单命令
  let statusBarCommand = vscode.commands.registerCommand('vs-file-action.showStatusBarMenu', async () => {
    const configPath = path.join(context.extensionPath, 'actions.json');
    const doc = await vscode.workspace.openTextDocument(configPath);
    await vscode.window.showTextDocument(doc);
  });


	// 注册命令，用于显示文件操作
  let disposable = vscode.commands.registerCommand('vs-file-action.showFileActions', async (uri: vscode.Uri) => {
    try {
      // 读取 actions.json 配置文件
      const configPath = path.join(context.extensionPath, 'actions.json');
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      // 获取文件扩展名
      const fileExtension = path.extname(uri.fsPath);
      
      // 查找匹配的文件类型操作
      const fileTypeAction = config.fileActions.find((fta: any) => fta.fileType === fileExtension);
      
      if (fileTypeAction && fileTypeAction.actions.length > 0) {
        // 显示可用操作列表
        const selectedAction = await vscode.window.showQuickPick(
          fileTypeAction.actions.map((action: any) => ({
            label: action.name,
            action: action
          })),
          { placeHolder: '选择要执行的操作' }
        );
        
        if (selectedAction) {
          const handler = registry.getHandler((selectedAction as any).action.type);
          if (handler) {
            await handler.execute(uri, (selectedAction as any).action.config);
          } else {
            vscode.window.showErrorMessage(`未找到处理器: ${(selectedAction as any).action.type}`);
          }
        }
      } else {
        vscode.window.showInformationMessage(`没有为 ${fileExtension} 类型的文件定义操作`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`执行失败: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(statusBarCommand);
}

export function deactivate() {}
