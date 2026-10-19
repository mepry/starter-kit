# 작업 알림 훅 (notify.ps1)

Claude Code가 작업을 끝냈거나 작업 중간에 사용자의 확인을 기다릴 때 **Windows 토스트 알림**을 띄우는 훅입니다.
Windows PowerShell 5.1에 들어 있는 기능만 사용하므로 따로 설치할 모듈이 없습니다.

## 알림이 오는 시점

| 훅 이벤트 | 알림이 오는 시점 | 알림 제목 |
|---|---|---|
| `Stop` | Claude가 응답(작업)을 끝낸 직후 | Claude 작업 완료 |
| `Notification` | 작업 중간에 권한 승인이나 입력을 기다릴 때 | Claude가 기다리고 있어요 |

알림 본문 앞에는 프로젝트 폴더 이름이 붙습니다. 예: `[starter-kit] 작업이 완료되었습니다`

### `idle_prompt`를 뺀 이유
`Notification` 훅에는 "작업이 끝난 뒤 약 60초 동안 입력이 없을 때" 오는 `idle_prompt` 알림도 있습니다.
이 알림은 `Stop` 알림과 겹치기 때문에 `matcher`로 아래 두 종류만 받도록 했습니다.

- `permission_prompt`: 권한 승인이 필요할 때
- `elicitation_dialog`: MCP 서버가 입력을 요청할 때

이렇게 하면 작업이 끝났을 때는 알림이 1번만 오고, 중간에 멈췄을 때도 놓치지 않습니다.

## 설치 방법

모든 프로젝트에서 알림을 받기 위해 **전역(사용자) 설정**에 등록합니다.

1. `notify.ps1`을 `~/.claude/hooks/notify.ps1`로 복사합니다.
2. `~/.claude/settings.json`에 아래 `hooks` 설정을 추가합니다. 경로는 본인 계정에 맞게 바꿔 주세요.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"C:/Users/<사용자명>/.claude/hooks/notify.ps1\""
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "permission_prompt|elicitation_dialog",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"C:/Users/<사용자명>/.claude/hooks/notify.ps1\""
          }
        ]
      }
    ]
  }
}
```

3. Claude Code에서 `/hooks`를 실행해 `Stop`과 `Notification` 아래에 훅이 보이는지 확인합니다.

> **프로젝트 설정에는 등록하지 마세요.** 이 저장소의 `.claude/settings.json`에도 같은 훅을 넣으면
> 전역 훅과 프로젝트 훅이 둘 다 실행되어 알림이 2번 옵니다.

## 참고 사항

- 스크립트는 **UTF-8 BOM**으로 저장되어 있습니다. Windows PowerShell 5.1은 BOM이 없는 파일을 시스템 인코딩(CP949)으로 읽어서 한글이 깨지므로, 수정한 뒤에도 BOM을 유지해야 합니다.
- 훅 입력 JSON도 UTF-8로 읽도록 `[Console]::InputEncoding`을 지정했습니다.
- 알림을 띄우다 오류가 나도 Claude 작업이 멈추지 않도록 오류를 무시하고 항상 `exit 0`으로 끝납니다.

## 알림이 안 뜰 때

- **Windows 설정 > 시스템 > 알림**에서 "Windows PowerShell" 알림이 켜져 있는지 확인합니다.
- 방해 금지 모드나 집중 모드가 켜져 있으면 알림이 화면에 뜨지 않고 알림 센터(`Win + N`)로만 갈 수 있습니다.
