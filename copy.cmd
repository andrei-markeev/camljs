"C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.0\tsc" --declaration CamlJs\camljs.ts --out camljs.d.ts
copy CamlJs\camljs.js Nuget\content\Scripts
copy CamlJs\camljs.js CamlJs.TestApp\Scripts
copy camljs.d.ts ..\DefinitelyTyped\camljs
copy CamlJs\camljs.js ..\camljs-console\Scripts\
copy camljs.d.ts ..\camljs-console\Scripts\typings\camljs
