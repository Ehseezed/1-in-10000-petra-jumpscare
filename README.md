# 1/10000 Petra Jumpscare
A configureable module for FoundryVTT that allows the session host to set up a gif and audio to play randomly if a chance succeeds


| Setting      | Scope  | Description                                                                                                                                  |
|--------------|--------|----------------------------------------------------------------------------------------------------------------------------------------------|
| Enabled      | World  | Enable or disable the module                                                                                                                 |
| Chance       | World  | The chance of the jumpscare happening every second expressed as a 1/[value] chance. Default is 1/10000.                                      |
| Image Path   | World  | A path to an image or animated WebP file. Path relative to the FoundryVTT/Data folder.                                                       |
| Audio Path   | World  | The path to an audio file played with the jumpscare. Path relative to the FoundryVTT/Data folder.                                            |
| Volume       | Client | The jumpscare audio volume.                                                                                                                  |
| Display Time | World  | Max time until the overlay is forcibly removed as a safety measure. The default is 15 seconds extend it if you have a really long animation. |