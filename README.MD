git clone --filter=blob:none --sparse https://github.com/Chucks1093/fragments.git
git sparse-checkout set client

git clone --filter=blob:none --sparse https://github.com/Chucks1093/AGT.git
cd AGT
git sparse-checkout set web
