"""Deploy checks on report.html against a pre-edit copy: tag balance, duplicate ids, dangling anchors,
sect-toc label/li/h3 counts, inline JS (node --check) and JSON-LD.

  pipecheck.py NEW.html OLD.html
"""
import re,sys,json,subprocess,tempfile,os
def stats(s):
    out={}
    for t in ('div','p','ul','li','em','strong','nav','section','span','table','a'):
        out[t]=(len(re.findall(r'<%s[\s>]'%t,s)),len(re.findall(r'</%s>'%t,s)))
    return out
new=open(sys.argv[1]).read(); old=open(sys.argv[2]).read()
sn,so=stats(new),stats(old)
for t in sn:
    dn=sn[t][0]-sn[t][1]; do=so[t][0]-so[t][1]
    flag='' if dn==do else '  <-- CHANGED BALANCE'
    if flag or t in('div','p','em','strong','li'): print('%-8s open-close new %d old %d%s'%(t,dn,do,flag))
ids=re.findall(r'\sid="([^"]+)"',new)
d=[i for i in set(ids) if ids.count(i)>1]; print('duplicate ids:',d)
idset=set(ids)
dang=sorted({h for h in re.findall(r'href="#([^"]+)"',new) if h not in idset})
print('dangling anchors:',dang[:20],len(dang))
# toc audit
bad=0;checked=0
for m in re.finditer(r'<nav class="sect-toc".*?</nav>',new,re.S):
    nav=m.group(0); lab=re.search(r'(\d+) parts',nav); lis=len(re.findall(r'<li',nav))
    # count h3 until next h2
    rest=new[m.end():]; nxt=re.search(r'<h2[^>]*\bid=',rest); seg=rest[:nxt.start()] if nxt else rest
    h3=len(re.findall(r'<h3 id=',seg)); checked+=1
    if not lab or int(lab.group(1))!=lis or lis!=h3:
        bad+=1; print('TOC mismatch: label',lab and lab.group(1),'li',lis,'h3',h3, nav[:80].replace('\n',' '))
print('tocs checked',checked,'mismatches',bad)
# inline js
fails=0;n=0
for m in re.finditer(r'<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script>',new,re.S):
    attrs,body=m.group(1),m.group(2)
    if 'ld+json' in attrs:
        try: json.loads(body)
        except Exception as e: fails+=1; print('JSON-LD fail',e)
        continue
    if not body.strip(): continue
    n+=1
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False) as f: f.write(body)
    r=subprocess.run(['node','--check',f.name],capture_output=True,text=True); os.unlink(f.name)
    if r.returncode: fails+=1; print('JS fail',r.stderr[:300])
print('inline js checked',n,'fails',fails)
