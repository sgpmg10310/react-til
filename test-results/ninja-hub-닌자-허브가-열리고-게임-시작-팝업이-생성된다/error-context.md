# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ninja-hub.spec.js >> 닌자 허브가 열리고 게임 시작 팝업이 생성된다
- Location: e2e/ninja-hub.spec.js:3:1

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> /var/folders/xb/3j0wpt7d0lj7dv95_v52jnt40000gn/T/cursor-sandbox-cache/0b779c3d3b6a2fd2a05e69457c35681d/playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-x64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/var/folders/xb/3j0wpt7d0lj7dv95_v52jnt40000gn/T/playwright_chromiumdev_profile-Ba0wni --remote-debugging-pipe --no-startup-window
<launched> pid=57665
[pid=57665][err] Received signal 11 SEGV_MAPERR 000000000010
[pid=57665][err]  [0x000107d952c3]
[pid=57665][err]  [0x000107d99103]
[pid=57665][err]  [0x7ff81b986fdd]
[pid=57665][err]  [0x000000000000]
[pid=57665][err]  [0x000104a47065]
[pid=57665][err]  [0x00010440a061]
[pid=57665][err]  [0x000104620176]
[pid=57665][err]  [0x000105db89b2]
[pid=57665][err]  [0x000105db99dc]
[pid=57665][err]  [0x00020cbd3366]
[pid=57665][err] [end of stack trace]
Call log:
  - <launching> /var/folders/xb/3j0wpt7d0lj7dv95_v52jnt40000gn/T/cursor-sandbox-cache/0b779c3d3b6a2fd2a05e69457c35681d/playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-x64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/var/folders/xb/3j0wpt7d0lj7dv95_v52jnt40000gn/T/playwright_chromiumdev_profile-Ba0wni --remote-debugging-pipe --no-startup-window
  - <launched> pid=57665
  - [pid=57665][err] Received signal 11 SEGV_MAPERR 000000000010
  - [pid=57665][err]  [0x000107d952c3]
  - [pid=57665][err]  [0x000107d99103]
  - [pid=57665][err]  [0x7ff81b986fdd]
  - [pid=57665][err]  [0x000000000000]
  - [pid=57665][err]  [0x000104a47065]
  - [pid=57665][err]  [0x00010440a061]
  - [pid=57665][err]  [0x000104620176]
  - [pid=57665][err]  [0x000105db89b2]
  - [pid=57665][err]  [0x000105db99dc]
  - [pid=57665][err]  [0x00020cbd3366]
  - [pid=57665][err] [end of stack trace]
  - [pid=57665] <gracefully close start>
  - [pid=57665] <kill>
  - [pid=57665] <will force kill>
  - [pid=57665] exception while trying to kill process: Error: kill EPERM
  - [pid=57665] <process did exit: exitCode=null, signal=SIGSEGV>
  - [pid=57665] starting temporary directories cleanup
  - [pid=57665] finished temporary directories cleanup
  - [pid=57665] <gracefully close end>

```