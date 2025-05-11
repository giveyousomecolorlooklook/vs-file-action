 
# VS File Action

一个用于自定义文件操作的 VS Code 扩展，支持通过右键菜单和状态栏快速执行预定义的文件操作。

## 功能特点

- 右键菜单集成
  - 在文件上右键可快速执行预定义操作
  - 根据文件类型显示不同的操作选项

- 状态栏快捷访问
  - 点击状态栏图标快速访问功能
  - 支持编辑配置和执行操作

- 支持多种操作类型
  - VS Code 命令
  - Shell 命令
  - NPM 脚本
  - 可扩展的自定义处理器

## 使用方法

1. **通过右键菜单**
   - 在文件上右键
   - 选择 "Show File Actions"
   - 从可用操作列表中选择

2. **通过状态栏**
   - 点击状态栏的 "File Actions" 图标
   - 选择：
     - 编辑配置文件
     - 对当前文件执行操作

## 配置说明

在 `actions.json` 中配置文件操作：

```json
{
  "fileActions": [
    {
      "fileType": ".js",
      "actions": [
        {
          "name": "格式化代码",
          "type": "vscode-command",
          "config": {
            "command": "editor.action.formatDocument"
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

        