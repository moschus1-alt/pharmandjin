# 에셋 출처와 명세

## 2026-10-07 리디자인 v2 (현재 사용)

Codex 내장 imagegen으로 새로 생성했다. 외부 에셋 다운로드나 외부 그래픽 프로그램은 사용하지 않았다. 아래 v1 파일은 기록 보존용이며 현재 렌더러는 `assets/redesign/manifest-v2.json`의 새 원본만 사용한다.

| 파일 | 용도 | 실제 규격 |
|---|---|---|
| `assets/redesign/team-v2.png` | 14종 아군 + 미사용 보조 소품 2개 | RGBA 1254×1254, 4×4 |
| `assets/redesign/visitors-v2.png` | 적·보스·경찰·이벤트 인물 16종 | RGBA 1254×1254, 4×4 |
| `assets/redesign/armored-v2.png` | 포장갑옷 적 | RGBA 1254×1254 |
| `assets/redesign/ending-v2.png` | 청소·휴식·놀람 포즈 6개 | RGBA 1536×1024, 3×2 |
| `assets/redesign/world-0-v2.png` | 동네약국 | RGB 1672×941 |
| `assets/redesign/world-1-v2.png` | 병원 앞 약국 | RGB 1672×941 |
| `assets/redesign/world-2-v2.png` | 심야약국 | RGB 1672×941 |

생성 프롬프트와 수정 경위: `docs/ART_V2_PROMPTS.md`. 알파/프레임 경계 결과: `qa/asset-v2-report.json`. 팀·방문객은 각각 16프레임이며 행 우선 순서다. 엔딩 첫 시안에도 실제 알파 채널이 있었으며, 게임 배경에 겹쳐 보이던 장식·주변 광채를 제거한 수정본을 사용한다. 음악과 효과음은 기존 Web Audio 합성 모듈을 유지한다.

방문객 아틀라스의 0부터 세는 11번 프레임은 오른쪽을 향한 경찰이다. 현재 `src/render.js`의 연행 장면에서는 경찰 프레임을 수평 반전 없이 오른쪽으로 이동시킨다. 왼쪽을 향한 적 프레임에만 `flip:true`를 적용하여 오른쪽으로 연행되는 방향을 맞춘다.

## v1 기록

모든 래스터 이미지는 2026-09-07 이 작업의 내장 Codex image_gen 도구로 새로 생성했다. 외부 에셋이나 외부 음악 파일을 사용하지 않았다.

| 파일 | 용도 | 생성 규격 |
|---|---|---|
| assets/allies-v1.png | 9종 아군 | 투명 RGBA, 3×3 아틀라스, 오른쪽 지향 한국형 SD 카툰 |
| assets/characters-v1.png | 10좀비·왕진상·경찰·영업사원·건물주·약국장·손님 | 투명 RGBA, 4×4 아틀라스, 적은 왼쪽 지향 |
| assets/pharmacies-v1.png | 동네·병원 앞·심야 약국 | 가로 배경 3개를 세로로 쌓은 아틀라스 |
| assets/manifest.json | 실제 프레임 영역 | 알파 연결 실루엣의 실제 경계를 측정해 직접 기록 |

원본 생성 결과는 균등 셀 경계를 일부 넘었다. 균등 셀 자르기를 사용하지 않고 완전한 캐릭터 영역을 사용한다. 원본 자체를 변경하지 않았다. 아군 9개, 인물 16개 주요 실루엣을 검출했으며 모두 원본 이미지 내부에 있다. 이 게임은 측면 전용이므로 4방향 보행 시트는 사용하지 않는다.

## 생성 프롬프트 요약

아군: "ONE production 2D game sprite atlas for Pharmacy & Jinsang ... transparent RGBA ... EXACTLY 3 columns x 3 rows ... display rack, rookie pharmacist, grappling staff, part-time pharmacist, syrup bottle, veteran with two capsules, roll-packaging machine, three-nozzle dispenser, ointment spatula ... RIGHT ... no text logo watermark."

적: "ONE sprite atlas ... EXACT 4 columns x 4 rows ... normal, coughing, office, bandage, delivery, elderly basket carrier, tipsy, complaining, smartphone, burly, king complainer, police, sales representative, landlord, pharmacy director, ordinary customer ... LEFT zombies ... no gore ... full body no overlap."

배경: "ONE game environment atlas: three equal horizontal panoramic strips stacked ... neighborhood daylight, hospital-front dispensing interior, overnight rainy pharmacy ... generous empty tiled floor ... no characters, no text, no logos."

소리는 src/audio.js의 독창적 Web Audio 절차적 합성이다. 테마별 템포·음계·패턴·레이어와 효과음 envelope를 코드로 관리한다.

## ending-v1.png
Codex image generation, 2026-09-07. Source exec-ebfb083c-a11a-424c-85b1-c2916fc1dd6b.png. Actual RGBA 1536×1024, six ending/reaction poses. Runtime manifest uses measured alpha bounds and separate row ranges. Two prior RGB checkerboard attempts were rejected and never shipped.

## extra-units-v1.png
Built-in Codex imagegen. Source exec-7ab3965d-7aaa-46f7-8a80-e3f11cda29d9.png. Transparent RGBA1536×1024. Five isolated pharmacy machines: mortar, spray, cold pack, capsule turret, paper pouch catapult. Prompt: cozy Korean chibi hand-ink cream/teal pharmacy machines facing right; 3×2 atlas, sixth cell empty; whole objects with transparent gutters, no names/logos/watermarks. Measured alpha bounds in assets/manifest.json.
