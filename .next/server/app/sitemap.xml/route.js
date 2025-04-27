"use strict";(()=>{var e={};e.id=717,e.ids=[717],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},2361:e=>{e.exports=require("events")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},1808:e=>{e.exports=require("net")},5477:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},4404:e=>{e.exports=require("tls")},7310:e=>{e.exports=require("url")},9796:e=>{e.exports=require("zlib")},6713:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>x,originalPathname:()=>q,patchFetch:()=>g,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>d,staticGenerationAsyncStorage:()=>m,staticGenerationBailout:()=>h});var o={};t.r(o),t.d(o,{GET:()=>u});var s=t(5419),i=t(9108),a=t(9678),p=t(8070),n=t(6323);async function u(){let e="https://tusitio.com",r=["","/login","/explorar","/ranking","/perfil","/dashboard"].map(r=>`
  <url>
    <loc>${e}${r}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`),t=(0,n.eI)("https://qdinmvlhendpkjimagnq.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY),{data:o}=await t.from("courses").select("id").limit(500),s=(o||[]).map(r=>`
  <url>
    <loc>${e}/curso/${r.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),i=`<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
  ${r.join("\n")}
  ${s.join("\n")}
</urlset>`;return new p.Z(i,{status:200,headers:{"Content-Type":"application/xml"}})}let l=new s.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/sitemap.xml/route",pathname:"/sitemap.xml",filename:"route",bundlePath:"app/sitemap.xml/route"},resolvedPagePath:"C:\\Users\\Carlos\\sl\xf1al\\src\\app\\sitemap.xml\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:c,staticGenerationAsyncStorage:m,serverHooks:d,headerHooks:x,staticGenerationBailout:h}=l,q="/sitemap.xml/route";function g(){return(0,a.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:m})}}};var r=require("../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[638,206,323],()=>t(6713));module.exports=o})();