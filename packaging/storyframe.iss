; Inno Setup script for Storyframe.
; Built by packaging/build.ps1, which passes StagingDir/OutputDir/MyAppVersion.

#define MyAppName "Storyframe"
#ifndef MyAppVersion
  #define MyAppVersion "0.3.0"
#endif
#ifndef StagingDir
  #define StagingDir "build\staging"
#endif
#ifndef OutputDir
  #define OutputDir "dist"
#endif

[Setup]
AppId={{9F3B2C4E-7A61-4E2D-9C3A-6D5E1B0F8A21}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher=Storyframe
DefaultDirName={localappdata}\Storyframe
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir={#OutputDir}
OutputBaseFilename=StoryframeSetup-{#MyAppVersion}-x64
SetupIconFile={#StagingDir}\storyframe.ico
UninstallDisplayIcon={app}\storyframe.ico
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
ArchitecturesAllowed=x64compatible

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Shortcuts:"

[Files]
Source: "{#StagingDir}\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion

[Icons]
Name: "{autoprograms}\Storyframe"; Filename: "{app}\python\pythonw.exe"; Parameters: """{app}\storyframe_app.pyw"""; WorkingDir: "{app}"; IconFilename: "{app}\storyframe.ico"
Name: "{autodesktop}\Storyframe"; Filename: "{app}\python\pythonw.exe"; Parameters: """{app}\storyframe_app.pyw"""; WorkingDir: "{app}"; IconFilename: "{app}\storyframe.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\webview2setup.exe"; Parameters: "/silent /install"; StatusMsg: "Checking WebView2..."; Flags: waituntilterminated skipifdoesntexist
Filename: "{app}\python\pythonw.exe"; Parameters: """{app}\storyframe_app.pyw"""; WorkingDir: "{app}"; Description: "Launch Storyframe now"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
