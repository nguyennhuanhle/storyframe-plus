' Portable launcher for Storyframe. Double-click to start the app with no
' console window. Runs the bundled pythonw.exe against storyframe_app.pyw.
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
base = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = base
pythonw = base & "\python\pythonw.exe"
app = base & "\storyframe_app.pyw"
sh.Run """" & pythonw & """ """ & app & """", 0, False
