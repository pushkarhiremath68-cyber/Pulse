using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace PulseMusic
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string targetUrl = "https://pulse-music-app-68.web.app";
                
                // Try launching in standalone App Mode via Microsoft Edge or Chrome
                string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
                if (!File.Exists(edgePath))
                {
                    edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
                }
                
                string chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
                if (!File.Exists(chromePath))
                {
                    chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");
                }

                if (File.Exists(edgePath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = edgePath,
                        Arguments = "--app=\"" + targetUrl + "\" --window-size=1280,840 --name=\"Pulse Music\"",
                        UseShellExecute = true
                    });
                }
                else if (File.Exists(chromePath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = chromePath,
                        Arguments = "--app=\"" + targetUrl + "\" --window-size=1280,840 --name=\"Pulse Music\"",
                        UseShellExecute = true
                    });
                }
                else
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = targetUrl,
                        UseShellExecute = true
                    });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not launch Pulse Music: " + ex.Message, "Pulse Music", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
