"""Extract `Q | url | quote` lines from a research note into JSONL for vq.py --batch.

  qlines.py NOTE.md OUT.jsonl
"""
import json,sys,re
out=[]
for line in open(sys.argv[1],encoding='utf-8'):
    m=re.match(r'^\s*Q \| (\S+) \| (.+?)\s*$',line)
    if m: out.append({'url':m.group(1),'q':m.group(2).strip()})
with open(sys.argv[2],'w') as f:
    for o in out: f.write(json.dumps(o,ensure_ascii=False)+'\n')
print(len(out),'quotes')
