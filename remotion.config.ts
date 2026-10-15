import {Config} from '@remotion/cli/config';

// Rendering defaults shared by `npm run render` and the Remotion CLI.
Config.setVideoImageFormat('png'); // PNG frames give a standard limited-range yuv420p stream
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(16);
Config.setAudioCodec('aac');
Config.setAudioBitrate('256k');
