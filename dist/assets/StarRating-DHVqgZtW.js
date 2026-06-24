import{a as e}from"./rolldown-runtime-COnpUsM8.js";import{a as t,u as n}from"./vendor-react-BwiEjoqX.js";import{t as r}from"./star-D2c-FfeL.js";var i=e(n(),1),a=t(),o=`C:/Users/HP/Documents/trash/press.openrockets.com/src/components/reviews/StarRating.tsx`;function s({rating:e=0,interactive:t=!1,onRate:n,size:s=16}){let[c,l]=(0,i.useState)(null),[u,d]=(0,i.useState)(!1),f=t?c??e:e,p=e=>{t&&(d(!0),setTimeout(()=>d(!1),300),n&&n(e))},m=n=>{let i=Math.max(0,Math.min(100,(f-(n-1))*100));return(0,a.jsxDEV)(`div`,{className:`relative ${t?`cursor-pointer`:``} ${t?t&&u&&(c??e)>=n?`animate-star-pulse`:`transition-transform duration-200 hover:scale-110`:``}`,onMouseEnter:()=>t&&l(n),onMouseLeave:()=>t&&l(null),onClick:()=>p(n),children:[(0,a.jsxDEV)(r,{size:s,className:`text-cream-border stroke-cream-border`},void 0,!1,{fileName:o,lineNumber:60,columnNumber:9},this),i>0&&(0,a.jsxDEV)(`div`,{className:`absolute top-0 left-0 overflow-hidden`,style:{width:`${i}%`},children:(0,a.jsxDEV)(r,{size:s,className:`text-gold fill-gold stroke-gold`},void 0,!1,{fileName:o,lineNumber:68,columnNumber:13},this)},void 0,!1,{fileName:o,lineNumber:64,columnNumber:11},this)]},n,!0,{fileName:o,lineNumber:52,columnNumber:7},this)};return(0,a.jsxDEV)(`div`,{className:`flex items-center gap-1`,children:[[1,2,3,4,5].map(e=>m(e)),(0,a.jsxDEV)(`style`,{children:`
        @keyframes starPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-star-pulse {
          animation: starPulse 0.3s ease-in-out;
        }
      `},void 0,!1,{fileName:o,lineNumber:79,columnNumber:7},this)]},void 0,!0,{fileName:o,lineNumber:76,columnNumber:5},this)}export{s as t};