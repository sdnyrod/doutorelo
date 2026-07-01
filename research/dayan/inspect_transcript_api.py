#!/usr/bin/env python3
from youtube_transcript_api import YouTubeTranscriptApi

api = YouTubeTranscriptApi
print("class_attrs", [name for name in dir(api) if not name.startswith("_")])
try:
    instance = YouTubeTranscriptApi()
    print("instance_attrs", [name for name in dir(instance) if not name.startswith("_")])
except Exception as exc:
    print("instance_error", type(exc).__name__, str(exc))
