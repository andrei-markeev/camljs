"C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.0\tsc" --declaration CamlJs\camljs.ts
copy CamlJs\camljs.js Nuget\content\Scripts
copy CamlJs\camljs.d.ts ..\DefinitelyTyped\camljs
copy CamlJs\camljs.js ..\camljs-console\Scripts\
copy CamlJs\camljs.d.ts ..\camljs-console\Scripts\typings\camljs
