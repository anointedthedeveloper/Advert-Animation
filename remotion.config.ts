import {Config} from '@remotion/cli/config';

// Master render: near-lossless H.264 (only used as the source for the final encode in scripts/render.mjs).
Config.setVideoImageFormat('png'); // PNG frames, no JPEG generation loss
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(1);
Config.setX264Preset('veryfast');
Config.setColorSpace('bt709'); // HD colour matrix, so greens match what browsers expect
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
