# VS File Action

一个用于自定义文件操作的 VS Code 扩展，支持通过右键菜单和状态栏快速执行预定义的文件操作。

## 使用方法

- 点击状态栏配置文件关联（可选）

- 支持多种操作类型
  - VS Code 命令
  - Shell 命令
  - NPM 脚本
  - 可扩展的自定义处理器

- 右键菜单集成
  - 在文件上右键可快速执行预定义操作
  - 根据文件类型显示不同的操作选项

- 标题栏按钮
  - 点击标题栏按钮，对当前打开的文件，快速执行预定义操作

## 配置说明



#### 变量支持

- `${filePath}`：当前文件完整路径
- `${fileDir}`：当前文件所在目录
- `${fileName}`：当前文件名
- `${extensionPath}`：插件根目录

#### 示例：自定义命令和工作目录

```json
{
  "fileActions": [
    {
      "fileType": ".csv",
      "actions": [
        {
          "name": "使用Excel打开",
          "type": "shell-command",
          "config": {
            "commands": [
              "start excel \"${filePath}\""
            ]
          }
        }
      ]
    },
    {
      "fileType": ".js",
      "actions": [
        {
          "name": "格式化代码",
          "type": "vscode-command",
          "config": {
            "command": "editor.action.formatDocument"
          }
        },
        {
          "name": "运行文件",
          "type": "shell-command",
          "config": {
            "commands": [
              "node ${filePath}"
            ]
          }
        },
        {
          "name": "使用 Prettier 格式化",
          "type": "npm-script",
          "config": {
            "commands": [
              "prettier --write ${filePath}"
            ]
          }
        }
      ]
    },
    {
      "fileType": ".ts",
      "actions": [
        {
          "name": "编译",
          "type": "shell-command",
          "config": {
            "commands": [
              "tsc ${filePath}"
            ]
          }
        },
        {
          "name": "运行 ts-node",
          "type": "shell-command",
          "config": {
            "commands": [
              "ts-node ${filePath}"
            ]
          }
        }
      ]
    },
    {
      "fileType": ".md",
      "actions": [
        {
          "name": "预览",
          "type": "vscode-command",
          "config": {
            "command": "markdown.showPreview"
          }
        }
      ]
    },
    {
      "fileType": ".png",
      "actions": [
        {
          "name": "ocr",
          "type": "shell-command",
          "config": {
            "commands": [
              "cd \"${extensionPath}\\bin\"",
              ".venv\\Scripts\\activate",
              "python \"${extensionPath}\\bin\\ocr_cn_cli.py\" -i \"${filePath}\" -o \"${fileDir}\\ocr_output.txt\""
            ]
          }
        }
      ]
    }
  ]
}
```


## 系统要求

- Visual Studio Code ^1.98.2

## 安装

1. 通过 VS Code 扩展市场安装
2. 重启 VS Code
3. 根据需要配置 `actions.json`

## 许可证

MIT

---

**开始使用 VS File Action 提升您的开发效率！**

