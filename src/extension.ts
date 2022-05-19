import * as os from 'os';
import { join } from 'path';
import * as vscode from 'vscode';

let replTerminal : vscode.Terminal
let replMode : ReplMode
let statusBarItem : vscode.StatusBarItem
let replCommand = "main"
let ghciScriptPath : string
let isWindows : boolean

enum ReplMode
{
    Open = 0,
    Run,
    Reload,
    Debug
}

export function activate(context: vscode.ExtensionContext) {
    
    isWindows = os.type() == "Windows_NT";
    
    ensureAllowFunctionKeyInTerminal();
    
    var ghciFileName = isWindows ? "ghci-win.txt" : "ghci.txt";
    
    ghciScriptPath = context.asAbsolutePath(join("resources", ghciFileName));
    
    var statusBarCommand = "haskell-repl.setReplFunction";

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
    statusBarItem.text = "REPL: Open";
    statusBarItem.command = statusBarCommand;
    statusBarItem.show();
    
    context.subscriptions.push(vscode.commands.registerCommand(statusBarCommand, async editor => {
        
        var result = await vscode.window.showInputBox({
            placeHolder: "main",
            prompt: "Enter a new command to use with REPL: Run. Leave empty to restore default"
        });
        
        if (!result)
            result = "main";
        
        replCommand = result;
        
        changeReplMode(true);
                
        if (editor)
            vscode.window.showTextDocument(editor.document);        
    }));
    
    vscode.window.onDidCloseTerminal(term => {

        //Closing a terminal that doesn't belong to us doesn't trigger this function. Never the the less,
        //It doesn't hurt to be safe!
        if (terminalExists()) {
            if (term.processId == getTerminal().processId)
                replTerminal = null!;
        }
    });
    
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('haskell-repl.execute', editor => {
        editor.document.save().then(executeRepl)
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand("haskell-repl.toggleReplMode", changeReplMode));
}

function executeRepl() {
    ensureAllowFunctionKeyInTerminal();
    
    if (replMode == ReplMode.Debug) {
        if (vscode.debug.activeDebugSession == undefined)
            vscode.commands.executeCommand("workbench.action.debug.start");
        else
            vscode.commands.executeCommand("workbench.action.debug.continue")
    }
    else {
        executeHaskellRepl();
        
        if (replMode == ReplMode.Run && !terminalExists() || replMode == ReplMode.Reload)
            replTerminal.show(true);
    }
}

function executeHaskellRepl() {
    if (terminalExists()) {
        const terminal : vscode.Terminal = getTerminal();
        terminal.show(true);
        terminal.sendText(":r");
        
        switch(replMode)
        {
            case ReplMode.Run:
                terminal.sendText(replCommand);
                break;
            case ReplMode.Reload:
                if (vscode.workspace.getConfiguration("haskell-repl").get("focusTerminalOnReload"))
                    vscode.commands.executeCommand("workbench.action.terminal.focus");
                    
                break;
        }
    }
    else {
        replMode = ReplMode.Open;
        
        const terminal : vscode.Terminal = getTerminal();
        
        var localScript = ghciScriptPath;
        
        if (isWindows && ghciScriptPath.includes(" "))
            localScript = "\\`\"" + localScript.replaceAll("\\", "\\\\") + "\\`\"";

        terminal.sendText(`stack ghci --ghci-options \"-ghci-script ${localScript}\"`);
        terminal.show(true);
        
        changeReplMode();
    }
}

function changeReplMode(noIncrement = false) {
    if (replMode == ReplMode.Debug)
        replMode = ReplMode.Run;
    else
    {
        if (!noIncrement)
            replMode++;
    }

    switch (replMode) {
        case ReplMode.Open:
            statusBarItem.text = "REPL: Open";
            break;

        case ReplMode.Run:
            statusBarItem.text = `REPL: Run (${replCommand})`;
            break;

        case ReplMode.Reload:
            statusBarItem.text = "REPL: Reload";
            break;

        case ReplMode.Debug:
            statusBarItem.text = "REPL: Debug"
            break;
    }
}

function ensureAllowFunctionKeyInTerminal() {
    var config = vscode.workspace.getConfiguration("terminal.integrated");
    var setting = config.get("commandsToSkipShell") as string[];
    
    if (!setting.includes("haskell-repl.execute")) {
        setting.push("haskell-repl.execute")
        config.update("commandsToSkipShell", setting, vscode.ConfigurationTarget.Global);
    }
}

function getTerminal() : vscode.Terminal {
    if (!replTerminal)
        replTerminal = vscode.window.createTerminal("REPL");
    
    return replTerminal;
}

function terminalExists() {
    if (replTerminal)
        return true;
    
    return false;
}

export function deactivate() {
    if (replTerminal)
        replTerminal.dispose();
}
