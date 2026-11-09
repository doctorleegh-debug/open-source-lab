import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const file=path.join(root,'data/episodes.json');
const episodes=JSON.parse(await fs.readFile(file,'utf8'));
const now=process.env.TEST_NOW?new Date(process.env.TEST_NOW):new Date();
if(!Number.isFinite(now.valueOf())) throw Error('Invalid time');
for(const ep of episodes){
 if(new Date(ep.expiresAt)<=now && ep.status!=='expired'){
  if(!/^episodes\/[a-z0-9-]+$/.test(ep.directory)) throw Error('Invalid episode path');
  await fs.rm(path.join(root,ep.directory),{recursive:true,force:true});
  ep.status='expired'; ep.removedAt=now.toISOString();
 }
}
await fs.writeFile(file,JSON.stringify(episodes,null,2)+'\n');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cards=episodes.map(e=>`<article><p class="eyebrow">${esc(e.id)} · ${e.status==='expired'?'공개 종료':'자료 공개 중'}</p><h2>${esc(e.title)}</h2><p>${esc(e.description)}</p>${e.status==='expired'?'<span class="muted">이 회차의 자료 공개가 종료되었습니다.</span>':`<a class="button" href="./${esc(e.directory)}/">자료 보기 <span>↗</span></a>`}</article>`).join('');
await fs.writeFile(path.join(root,'index.html'),`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>오픈소스 실험실</title><link rel="stylesheet" href="./style.css"><body><main class="home"><p class="eyebrow">OPEN SOURCE LAB / FIELD NOTES</p><h1>좋은 도구를 찾는 일.<br><em>이제 더 간단하게.</em></h1><p class="lede">GitHub에서 찾은 오픈소스의 기능, 사용 조건과 공식 링크를 한곳에 정리합니다.</p><section class="episodes">${cards}</section><footer>별 수는 안전성을 인증하지 않습니다. 공식 배포처와 라이선스를 직접 확인하세요.<br>이 사이트는 공개 페이지입니다. 개인정보를 수집하거나 방문자를 추적하지 않습니다.</footer></main></body></html>`);
console.log(JSON.stringify({checkedAt:now.toISOString(),episodes:episodes.map(e=>({id:e.id,status:e.status}))}));
