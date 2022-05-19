# haskell-repl

[![Appveyor status](https://ci.appveyor.com/api/projects/status/6coywdjcmb00ckmj?svg=true)](https://ci.appveyor.com/project/lordmilko/haskell-repl)

haskell-repl is a Visual Studio Code extension that provides an easy to use GHCi REPL for use in Haskell development.

Coming from a Visual Studio background wherein you can immediately run/debug a program by hitting F5, it is quite jarring trying to learn languages like Haskell within text editors with much more primitive tooling. To me, the notion I need to type out a whole bunch of stuff whenever I want to test a program is completely unacceptable. I want to be able to rapidly make changes and test them out; if it takes more than one keystroke in order to do that, we have a serious problem here.

With GHCi being such an essential part of the Haskell development experience, it makes sense that it play an integral part of our rapid Haskell development solution.

haskell-repl provides keybindings to the F5 key in Visual Studio Code to easily

* Start a `stack` based GHCi REPL in a dedicated terminal
* Reload your program and run a given command (by default `main`)
* Reload the program and focus the terminal so that you may run an arbitrary command, and
* Defer to the default F5 debugging experience, where the Haskell Debugger specified in your `launch.json` is launched instead

Personally, as of writing I have not found the current state of Haskell Debuggers to be particularly impressive; GHC does not seem to be particularly tool friendly, and the fact that most values are lazily evaluated and cannot be displayed by the debugger completely defeats the point of the operation here. Hopefully this extension will at least fill part of that gap

## Keybindings

* Ctrl+Shift+R: toggle between Run/Reload/Debug modes
* Ctrl+Shift+D: specify the command to execute when REPL: Run mode is active

You may also specify the REPL: Run command by clicking on the haskell-repl button in your taskbar

## Settings

`haskell-repl.focusTerminalOnReload`: specifies whether hitting F5 when in REPL: Reload mode should cause the REPL terminal to be focused. By default this value is `true`

## Notes

In order to use F5 when the terminal is already focused, `terminal.integrated.commandsToSkipShell` needs to contain haskell-repl's command `haskell-repl.execute`. As such haskell-repl will automatically add this command to your global `Settings.json` file if it detects it is missing

This extension only supports running GHCi via `stack ghci`. I'm not here to develop vscode extensions, I'm here to learn Haskell!

If running on Windows and the path to your vscode extension directly contains a space (i.e. there is a space in your username), haskell-repl will assume your default Terminal is PowerShell and escape any quotes in the GHCi startup command accordingly. If you have changed your default terminal from PowerShell to something else, you'll probably run into issues. If so, please report them and I'll see what can be done.