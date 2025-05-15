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
  async execute(uri: vscode.Uri, config: { command: string, cwd?: string }) {
    const command = config.command
      .replace('${filePath}', uri.fsPath)
      .replace('${fileDir}', path.dirname(uri.fsPath));
    
    // 查找已存在的终端
    let terminal = vscode.window.terminals.find(t => t.name === 'shell-command');
    
    // 如果找到了终端，检查它是否在运行命令
    if (terminal) {
      // 没有好的办法，以后补充。
    } else {
      // 如果没有找到终端，创建新的
      terminal = vscode.window.createTerminal('shell-command');
    }
    
    terminal.sendText(command);
    terminal.show();
  }
});

registry.register('npm-script', {
  async execute(uri: vscode.Uri, config: { script: string }) {
    // 查找已存在的NPM Script终端
    let terminal = vscode.window.terminals.find(t => t.name === 'NPM Script');
    
    // 如果没有找到就创建新的终端
    if (!terminal) {
      terminal = vscode.window.createTerminal('NPM Script');
    }
    const command = config.script
      .replace('${filePath}', uri.fsPath)
      .replace('${fileDir}', path.dirname(uri.fsPath));
    
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
  statusBarItem.tooltip = "管理文件操作";
  statusBarItem.command = 'vs-file-action.showStatusBarMenu';
  statusBarItem.show();
  
  // 注册状态栏菜单命令
  let statusBarCommand = vscode.commands.registerCommand('vs-file-action.showStatusBarMenu', async () => {
    const selection = await vscode.window.showQuickPick(
      [
        {
          label: "$(edit) 编辑配置文件",
          description: "修改 actions.json 配置文件",
          value: "edit"
        },
        {
          label: "$(play) 执行文件操作",
          description: "对当前文件执行操作",
          value: "execute"
        }
      ],
      {
        placeHolder: "选择操作"
      }
    );

    if (selection) {
      if (selection.value === "edit") {
        const configPath = path.join(context.extensionPath, 'actions.json');
        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
      } else if (selection.value === "execute") {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          vscode.commands.executeCommand('vs-file-action.showFileActions', editor.document.uri);
        } else {
          vscode.window.showWarningMessage('请先打开一个文件');
        }
      }
    }
  });
	
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
