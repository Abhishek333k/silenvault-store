@echo off
title SilenVault AI Factory
echo ==================================================
echo         SILENVAULT AI PIPELINE INITIATED
echo ==================================================

:: Set the script to run in the current directory
cd /d "%~dp0"

:: Check if a folder was dragged and dropped
set "TARGET_FOLDER=%~1"

:: If nothing was dragged, ask the user to paste or browse
if "%TARGET_FOLDER%"=="" (
    echo [No folder dragged and dropped.]
    set /p "TARGET_FOLDER=Paste the folder path here (or press ENTER to open a Folder Picker): "
)

:: If they just pressed Enter, open the Windows GUI Folder Browser
if "%TARGET_FOLDER%"=="" (
    echo.
    echo Opening Folder Picker...
    for /f "delims=" %%I in ('powershell -NoProfile -Command "Add-Type -AssemblyName System.windows.forms; $f = New-Object System.Windows.Forms.FolderBrowserDialog; $f.ShowNewFolderButton = $false; $f.Description = 'Select the SilenVault product folder to process'; if ($f.ShowDialog() -eq 'OK') { $f.SelectedPath }"') do set "TARGET_FOLDER=%%I"
)

:: If they cancelled the folder picker, exit safely
if "%TARGET_FOLDER%"=="" (
    echo [ERROR] No folder selected. Process aborted.
    pause
    exit /b
)

echo.
echo Processing Directory: "%TARGET_FOLDER%"
echo ==================================================
echo.

:: Run the Python script and pass the chosen folder
python ai_renamer.py "%TARGET_FOLDER%"

echo.
echo ==================================================
echo         PROCESS COMPLETE.
echo ==================================================
pause