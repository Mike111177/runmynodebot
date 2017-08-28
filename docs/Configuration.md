# Overview
Warning: This software is in very early development, your configuration may not survive updates.

Runmynodebot uses config files in the [YAML](http://www.YAML.org) format in order to configure parts and hardware attached to the robot. 
These files are spilt into four sections. For a sample see [template.yml](../hardware/template.yml).
## Boards
Boards are used to define boards and IO expanders that are used to power your robotic parts.
Currently in version 1.1.0 the only supported board is the Raspberry Pi.

Boards used in your robot must be defined in the `boards:` section of your config file by their hardware "type". This table shows all supported IO boards and their respective types.

Board | Type | Requirements
----- | ----- | -----------
Raspberry Pi | `Raspberry_Pi` | [Raspi-IO](https://github.com/bryan-m-hughes/raspi-io)

Here is a sample `boards:` config.
```yaml
boards: 
  - type: Raspberry_Pi # Raspberry pi with default settings.
    id: Pi # The id field is used for both programmatic access.
           # The id field can actually be omitted in most cases
           # here because without it the id will just be the type field.
```

## Parts
Parts are all of the components used to drive your robot such as Motors, LED's, Servos, and other fun things. 
They are defined by a type, and id and their part specific options.
Below is a sample config for a robot with a single LED.
```yaml
parts: 
  - id: STATUS # The id of any part (or board for that matter) is arbitrary, as long as it is unique.
    type: Led # The type is in-fact case sensitive.
    options:  
      pin: 0 # All of these fields get pushed directly to the johnny-five library.
      controller: PCA9685 # This controller and address allows an LED to be powered by the adrafruit motorhats 'Xtra PWMS' 
      address: 0x60
```

For more info on parts and their configuration see [Part Descriptors](Part_Descriptors.md).

You can also use presets instead of options on part types that have them available:
```yaml
parts: 
  - id: M1
    type: Motor
    preset: ADAFRUIT_V2.M1 # Adafruit motorhat M1
```
If you use both a preset and options on a part, the options will take priority.

## Driving
The driving section defines how the robot moves around when receiving commands from letsrobot.tv
Here is a sample `driving:` section.
```yaml
driving: 
  mode: fcfs_tank # Mode is selected from the drive_modes folder.
  motors: # Motors 1 and 2 are the left drive wheels, and 3 and 4 are the right drive wheels. 
    left: 
      - M1 # These correspond to the id's you assigned to your motors above in the parts section.
      - M2
    right: 
      - M3
      - M4
```
## Plugins
The `plugins:` section defines what add-on software will run alongside the bot. 
Some plugins are built into this program and you can also supply your own plugins.
For more information on creating a custom plugin see [Plugins](Plugins.md).

Below is a sample `plugins:` section:
```yaml
plugins: 
  sounds: # The built-in sounds plugin allows you to play .wav files over the speakers when the bot receives commands
    options: 
      LOUD: /home/pi/loud_noise.wav
  myplugin: 
    # The path field tells runmynodebot that this plugin is custom, and where to find it. 
    path: myplugin.js # Paths can be relative to the config file.
      options: # The options field is passed directly to the plugin. 
        myoption: myvalue
```
## Video
The optional `video:` section can include settings for video output. All video settings are optional, and oftentimes will be default selected by the program.

Different video settings include:

Setting | Default | Description
------- | ------- | -----------
`kbps:`| 350 | Bitrate which will be sent to the server in kbps
`videoDeviceNumber:` | 0 | The device number of the camera to be used.
`audioDeviceNumber:` | 1 | The device number of the microphone to be used.
`micChannels:` | auto | The number of channels your microphone has. You probably won't need to set this.
`resolution:` | 640x480 | Output resolution of the stream.
`filters:` | none | See [Filters](Filters.md)

Below is a sample `video:` section:
```yaml
video: 
  kbps: 700 # Setting output bitrate to 1000 kbps
  resolution: 800x600
  filters: 
  	type: dynoverlay # Creating an overlay
  	file: myoverlay.png # Setting the image for the overlay
```