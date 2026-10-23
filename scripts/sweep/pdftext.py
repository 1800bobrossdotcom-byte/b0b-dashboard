import sys, types
# stub broken cryptography backend so pypdf imports (unencrypted PDFs only)
for m in ['cryptography','cryptography.hazmat','cryptography.hazmat.primitives','cryptography.hazmat.primitives.ciphers','cryptography.hazmat.primitives.ciphers.algorithms','cryptography.hazmat.primitives.ciphers.modes','cryptography.hazmat.primitives.padding','cryptography.hazmat.backends','cryptography.hazmat.decrepit','cryptography.hazmat.decrepit.ciphers','cryptography.hazmat.decrepit.ciphers.algorithms']:
    sys.modules[m]=types.ModuleType(m)
import importlib
try:
    import pypdf._crypt_providers as cp
except Exception as e:
    pass
from pypdf import PdfReader
r=PdfReader(sys.argv[1])
for i,p in enumerate(r.pages):
    print(f"\n=== page {i+1} ===")
    print(p.extract_text())
