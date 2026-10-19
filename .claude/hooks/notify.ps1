# Claude Code 훅(Stop, Notification)에서 호출되어 Windows 토스트 알림을 표시한다.
# stdin으로 훅 JSON을 받아 이벤트 종류에 따라 제목과 문구를 정한다.

try {
  # 훅 입력 JSON은 UTF-8이므로 기본 코드페이지(CP949)로 읽지 않도록 지정한다
  [Console]::InputEncoding = [Text.Encoding]::UTF8
  $raw = [Console]::In.ReadToEnd()
  $data = $null
  if ($raw) { $data = $raw | ConvertFrom-Json }

  $project = ''
  if ($data -and $data.cwd) { $project = Split-Path -Leaf $data.cwd }

  if ($data -and $data.hook_event_name -eq 'Notification') {
    $title = 'Claude가 기다리고 있어요'
    $body = if ($data.message) { $data.message } else { '확인이 필요합니다' }
  } else {
    $title = 'Claude 작업 완료'
    $body = '작업이 완료되었습니다'
  }
  if ($project) { $body = "[$project] $body" }

  $title = [System.Security.SecurityElement]::Escape($title)
  $body = [System.Security.SecurityElement]::Escape($body)

  [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
  [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

  $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
  $xml.LoadXml("<toast><visual><binding template=`"ToastGeneric`"><text>$title</text><text>$body</text></binding></visual></toast>")

  $appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
  $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
  [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
} catch {
  # 알림 실패가 Claude 작업을 막지 않도록 무시한다
}
exit 0
