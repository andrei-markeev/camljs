"C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.8\tsc" CamlJs\camljs.ts
"C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.8\tsc" --declaration CamlJs\camljs.ts
move /y CamlJs\camljs.d.ts .\
copy CamlJs\camljs.js Nuget\content\Scripts
copy CamlJs\camljs.js CamlJs.TestApp\Scripts
copy camljs.d.ts ..\DefinitelyTyped\camljs
copy CamlJs\camljs.js ..\camljs-console\Scripts\
copy camljs.d.ts ..\camljs-console\Scripts\typings\camljs
