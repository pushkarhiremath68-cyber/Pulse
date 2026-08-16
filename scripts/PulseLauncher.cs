using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using System.Runtime.InteropServices;

namespace PulseMusicApp
{
    static class Program
    {
        [DllImport("user32.dll")]
        private static extern bool SetProcessDPIAware();

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                SetProcessDPIAware();
            }
            catch { }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appUrl = "https://pushkarhiremath68-cyber.github.io/Pulse/";
            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "icon.ico");

            // 1. Create Desktop & Start Menu Shortcuts if WScript is available
            try
            {
                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string startMenu = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
                string currentExe = Process.GetCurrentProcess().MainModule.FileName;

                CreateShortcut(Path.Combine(desktop, "Pulse Music.lnk"), currentExe, iconPath);
                CreateShortcut(Path.Combine(startMenu, "Pulse Music.lnk"), currentExe, iconPath);
            }
            catch { }

            // 2. Locate Best Chromium Browser for Standalone Window Execution
            string[] browsers = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
            };

            string browserPath = null;
            foreach (string b in browsers)
            {
                if (File.Exists(b))
                {
                    browserPath = b;
                    break;
                }
            }

            if (browserPath != null)
            {
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = browserPath;
                    psi.Arguments = "--app=" + appUrl;
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                    return;
                }
                catch { }
            }

            // Fallback: Default system browser
            try
            {
                Process.Start(new ProcessStartInfo(appUrl) { UseShellExecute = true });
            }
            catch
            {
                MessageBox.Show("Unable to open Pulse Music. Please visit: " + appUrl, "Pulse Music", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        static void CreateShortcut(string shortcutPath, string targetExe, string icon)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    dynamic shell = Activator.CreateInstance(shellType);
                    dynamic shortcut = shell.CreateShortcut(shortcutPath);
                    shortcut.TargetPath = targetExe;
                    shortcut.Arguments = "";
                    shortcut.Description = "Pulse Music - High-Fidelity Music Streaming by Pushkar Hiremath";
                    if (File.Exists(icon))
                    {
                        shortcut.IconLocation = icon + ",0";
                    }
                    else
                    {
                        shortcut.IconLocation = targetExe + ",0";
                    }
                    shortcut.Save();
                }
            }
            catch { }
        }
    }
}
