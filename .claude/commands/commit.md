---
description: 커밋 메시지를 받아 커밋하고, 메시지가 없으면 변경 내용을 분석해 자동으로 작성
argument-hint: [커밋 메시지]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

## 현재 상태

- 변경 파일: !`git status --short`
- 스테이징된 변경: !`git diff --cached --stat`
- 전체 변경 내용: !`git diff HEAD`
- 최근 커밋: !`git log --oneline -5`

## 입력된 커밋 메시지

"$ARGUMENTS"

## 작업 순서

1. 변경 사항이 하나도 없으면 커밋하지 않고 "커밋할 변경 사항이 없습니다"라고 알린 뒤 종료한다.

2. 커밋 메시지를 정한다.
   - 위 "입력된 커밋 메시지"가 비어 있지 않으면 **그 문자열을 수정 없이 그대로** 사용한다.
   - 비어 있으면 변경 내용을 분석해 직접 작성한다.
     - 형식: `<type>: <한국어 요약>`
     - type: `feat`(기능), `fix`(버그), `refactor`(구조 개선), `docs`(문서), `style`(포맷), `test`(테스트), `chore`(설정/빌드/기타)
     - 제목은 50자 이내, 명사형으로 끝낸다 (예: `feat: 북마크 기능 추가`)
     - 변경이 여러 갈래면 빈 줄 뒤에 본문으로 `- 변경 내용과 이유`를 bullet로 적는다
     - 최근 커밋의 형식을 따른다

3. 스테이징한다.
   - 이미 스테이징된 파일이 있으면 그 파일만 커밋한다 (추가로 `git add` 하지 않는다).
   - 스테이징된 파일이 없으면 변경·추가된 파일을 파일명으로 지정해 `git add` 한다.
   - `.env`, `*.pem`, `*.key`, 인증 정보가 담긴 파일은 절대 추가하지 말고 사용자에게 경고한다.

4. `git commit`을 실행한다. 여러 줄 메시지는 heredoc으로 전달한다.

5. `git log --oneline -1`로 결과를 보여주고, 사용한 메시지가 입력값인지 자동 작성인지 함께 알린다.

6. push는 하지 않는다. pre-commit hook이 실패하면 `--no-verify`로 우회하지 말고 원인과 해결 방법을 알린다.
