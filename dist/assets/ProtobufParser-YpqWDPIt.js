import{c as _e,g as zn,b as Vn,r as ve,j as x}from"./index-C8_Qd-8h.js";var dn={exports:{}},pn={exports:{}},mn={},qe={},yn=$n;function $n(s,e){for(var i=new Array(arguments.length-1),c=0,u=2,a=!0;u<arguments.length;)i[c++]=arguments[u++];return new Promise(function(o,t){i[c]=function(l){if(a)if(a=!1,l)t(l);else{for(var f=new Array(arguments.length-1),d=0;d<f.length;)f[d++]=arguments[d];o.apply(null,f)}};try{s.apply(e||null,i)}catch(r){a&&(a=!1,t(r))}})}var gn={};(function(s){var e=s;e.length=function(o){var t=o.length;if(!t)return 0;for(var r=0;--t%4>1&&o.charAt(t)==="=";)++r;return Math.ceil(o.length*3)/4-r};for(var i=new Array(64),c=new Array(123),u=0;u<64;)c[i[u]=u<26?u+65:u<52?u+71:u<62?u-4:u-59|43]=u++;e.encode=function(o,t,r){for(var l=null,f=[],d=0,p=0,m;t<r;){var y=o[t++];switch(p){case 0:f[d++]=i[y>>2],m=(y&3)<<4,p=1;break;case 1:f[d++]=i[m|y>>4],m=(y&15)<<2,p=2;break;case 2:f[d++]=i[m|y>>6],f[d++]=i[y&63],p=0;break}d>8191&&((l||(l=[])).push(String.fromCharCode.apply(String,f)),d=0)}return p&&(f[d++]=i[m],f[d++]=61,p===1&&(f[d++]=61)),l?(d&&l.push(String.fromCharCode.apply(String,f.slice(0,d))),l.join("")):String.fromCharCode.apply(String,f.slice(0,d))};var a="invalid encoding";e.decode=function(o,t,r){for(var l=r,f=0,d,p=0;p<o.length;){var m=o.charCodeAt(p++);if(m===61&&f>1)break;if((m=c[m])===void 0)throw Error(a);switch(f){case 0:d=m,f=1;break;case 1:t[r++]=d<<2|(m&48)>>4,d=m,f=2;break;case 2:t[r++]=(d&15)<<4|(m&60)>>2,d=m,f=3;break;case 3:t[r++]=(d&3)<<6|m,f=0;break}}if(f===1)throw Error(a);return r-l},e.test=function(o){return/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o)}})(gn);var Un=De;function De(){this._listeners=Object.create(null)}De.prototype.on=function(e,i,c){return(this._listeners[e]||(this._listeners[e]=[])).push({fn:i,ctx:c||this}),this};De.prototype.off=function(e,i){if(e===void 0)this._listeners=Object.create(null);else if(i===void 0)this._listeners[e]=[];else{var c=this._listeners[e];if(!c)return this;for(var u=0;u<c.length;)c[u].fn===i?c.splice(u,1):++u}return this};De.prototype.emit=function(e){var i=this._listeners[e];if(i){for(var c=[],u=1;u<arguments.length;)c.push(arguments[u++]);for(u=0;u<i.length;)i[u].fn.apply(i[u++].ctx,c)}return this};var Jn=St(St);function St(s){return typeof Float32Array<"u"?function(){var e=new Float32Array([-0]),i=new Uint8Array(e.buffer),c=i[3]===128;function u(t,r,l){e[0]=t,r[l]=i[0],r[l+1]=i[1],r[l+2]=i[2],r[l+3]=i[3]}function a(t,r,l){e[0]=t,r[l]=i[3],r[l+1]=i[2],r[l+2]=i[1],r[l+3]=i[0]}s.writeFloatLE=c?u:a,s.writeFloatBE=c?a:u;function n(t,r){return i[0]=t[r],i[1]=t[r+1],i[2]=t[r+2],i[3]=t[r+3],e[0]}function o(t,r){return i[3]=t[r],i[2]=t[r+1],i[1]=t[r+2],i[0]=t[r+3],e[0]}s.readFloatLE=c?n:o,s.readFloatBE=c?o:n}():function(){function e(c,u,a,n){var o=u<0?1:0;if(o&&(u=-u),u===0)c(1/u>0?0:2147483648,a,n);else if(isNaN(u))c(2143289344,a,n);else if(u>34028234663852886e22)c((o<<31|2139095040)>>>0,a,n);else if(u<11754943508222875e-54)c((o<<31|Math.round(u/1401298464324817e-60))>>>0,a,n);else{var t=Math.floor(Math.log(u)/Math.LN2),r=Math.round(u*Math.pow(2,-t)*8388608)&8388607;c((o<<31|t+127<<23|r)>>>0,a,n)}}s.writeFloatLE=e.bind(null,Ct),s.writeFloatBE=e.bind(null,Ft);function i(c,u,a){var n=c(u,a),o=(n>>31)*2+1,t=n>>>23&255,r=n&8388607;return t===255?r?NaN:o*(1/0):t===0?o*1401298464324817e-60*r:o*Math.pow(2,t-150)*(r+8388608)}s.readFloatLE=i.bind(null,Lt),s.readFloatBE=i.bind(null,Bt)}(),typeof Float64Array<"u"?function(){var e=new Float64Array([-0]),i=new Uint8Array(e.buffer),c=i[7]===128;function u(t,r,l){e[0]=t,r[l]=i[0],r[l+1]=i[1],r[l+2]=i[2],r[l+3]=i[3],r[l+4]=i[4],r[l+5]=i[5],r[l+6]=i[6],r[l+7]=i[7]}function a(t,r,l){e[0]=t,r[l]=i[7],r[l+1]=i[6],r[l+2]=i[5],r[l+3]=i[4],r[l+4]=i[3],r[l+5]=i[2],r[l+6]=i[1],r[l+7]=i[0]}s.writeDoubleLE=c?u:a,s.writeDoubleBE=c?a:u;function n(t,r){return i[0]=t[r],i[1]=t[r+1],i[2]=t[r+2],i[3]=t[r+3],i[4]=t[r+4],i[5]=t[r+5],i[6]=t[r+6],i[7]=t[r+7],e[0]}function o(t,r){return i[7]=t[r],i[6]=t[r+1],i[5]=t[r+2],i[4]=t[r+3],i[3]=t[r+4],i[2]=t[r+5],i[1]=t[r+6],i[0]=t[r+7],e[0]}s.readDoubleLE=c?n:o,s.readDoubleBE=c?o:n}():function(){function e(c,u,a,n,o,t){var r=n<0?1:0;if(r&&(n=-n),n===0)c(0,o,t+u),c(1/n>0?0:2147483648,o,t+a);else if(isNaN(n))c(0,o,t+u),c(2146959360,o,t+a);else if(n>17976931348623157e292)c(0,o,t+u),c((r<<31|2146435072)>>>0,o,t+a);else{var l;if(n<22250738585072014e-324)l=n/5e-324,c(l>>>0,o,t+u),c((r<<31|l/4294967296)>>>0,o,t+a);else{var f=Math.floor(Math.log(n)/Math.LN2);f===1024&&(f=1023),l=n*Math.pow(2,-f),c(l*4503599627370496>>>0,o,t+u),c((r<<31|f+1023<<20|l*1048576&1048575)>>>0,o,t+a)}}}s.writeDoubleLE=e.bind(null,Ct,0,4),s.writeDoubleBE=e.bind(null,Ft,4,0);function i(c,u,a,n,o){var t=c(n,o+u),r=c(n,o+a),l=(r>>31)*2+1,f=r>>>20&2047,d=4294967296*(r&1048575)+t;return f===2047?d?NaN:l*(1/0):f===0?l*5e-324*d:l*Math.pow(2,f-1075)*(d+4503599627370496)}s.readDoubleLE=i.bind(null,Lt,0,4),s.readDoubleBE=i.bind(null,Bt,4,0)}(),s}function Ct(s,e,i){e[i]=s&255,e[i+1]=s>>>8&255,e[i+2]=s>>>16&255,e[i+3]=s>>>24}function Ft(s,e,i){e[i]=s>>>24,e[i+1]=s>>>16&255,e[i+2]=s>>>8&255,e[i+3]=s&255}function Lt(s,e){return(s[e]|s[e+1]<<8|s[e+2]<<16|s[e+3]<<24)>>>0}function Bt(s,e){return(s[e]<<24|s[e+1]<<16|s[e+2]<<8|s[e+3])>>>0}var vn={};(function(s){var e=s,i="�";e.length=function(u){for(var a=0,n=0,o=0;o<u.length;++o)n=u.charCodeAt(o),n<128?a+=1:n<2048?a+=2:(n&64512)===55296&&(u.charCodeAt(o+1)&64512)===56320?(++o,a+=4):a+=3;return a},e.read=function(u,a,n){if(n-a<1)return"";for(var o="",t=a;t<n;){var r=u[t++];if(r<=127)o+=String.fromCharCode(r);else if(r>=192&&r<224){var l=(r&31)<<6|u[t++]&63;o+=l>=128?String.fromCharCode(l):i}else if(r>=224&&r<240){var f=(r&15)<<12|(u[t++]&63)<<6|u[t++]&63;o+=f>=2048?String.fromCharCode(f):i}else if(r>=240){var d=(r&7)<<18|(u[t++]&63)<<12|(u[t++]&63)<<6|u[t++]&63;d<65536||d>1114111?o+=i:(d-=65536,o+=String.fromCharCode(55296+(d>>10)),o+=String.fromCharCode(56320+(d&1023)))}}return o},e.write=function(u,a,n){for(var o=n,t,r,l=0;l<u.length;++l)t=u.charCodeAt(l),t<128?a[n++]=t:t<2048?(a[n++]=t>>6|192,a[n++]=t&63|128):(t&64512)===55296&&((r=u.charCodeAt(l+1))&64512)===56320?(t=65536+((t&1023)<<10)+(r&1023),++l,a[n++]=t>>18|240,a[n++]=t>>12&63|128,a[n++]=t>>6&63|128,a[n++]=t&63|128):(a[n++]=t>>12|224,a[n++]=t>>6&63|128,a[n++]=t&63|128);return n-o}})(vn);var Wn=Hn;function Hn(s,e,i){var c=i||8192,u=c>>>1,a=null,n=c;return function(t){if(t<1||t>u)return s(t);n+t>c&&(a=s(c),n=0);var r=e.call(a,n,n+=t);return n&7&&(n=(n|7)+1),r}}var ze,Pt;function Zn(){if(Pt)return ze;Pt=1,ze=e;var s=de();function e(a,n){this.lo=a>>>0,this.hi=n>>>0}var i=e.zero=new e(0,0);i.toNumber=function(){return 0},i.zzEncode=i.zzDecode=function(){return this},i.length=function(){return 1};var c=e.zeroHash="\0\0\0\0\0\0\0\0";e.fromNumber=function(n){if(n===0)return i;var o=n<0;o&&(n=-n);var t=n>>>0,r=(n-t)/4294967296>>>0;return o&&(r=~r>>>0,t=~t>>>0,++t>4294967295&&(t=0,++r>4294967295&&(r=0))),new e(t,r)},e.from=function(n){if(typeof n=="number")return e.fromNumber(n);if(s.isString(n))if(s.Long)n=s.Long.fromString(n);else return e.fromNumber(parseInt(n,10));return n.low||n.high?new e(n.low>>>0,n.high>>>0):i},e.prototype.toNumber=function(n){if(!n&&this.hi>>>31){var o=~this.lo+1>>>0,t=~this.hi>>>0;return o||(t=t+1>>>0),-(o+t*4294967296)}return this.lo+this.hi*4294967296},e.prototype.toLong=function(n){return s.Long?new s.Long(this.lo|0,this.hi|0,!!n):{low:this.lo|0,high:this.hi|0,unsigned:!!n}};var u=String.prototype.charCodeAt;return e.fromHash=function(n){return n===c?i:new e((u.call(n,0)|u.call(n,1)<<8|u.call(n,2)<<16|u.call(n,3)<<24)>>>0,(u.call(n,4)|u.call(n,5)<<8|u.call(n,6)<<16|u.call(n,7)<<24)>>>0)},e.prototype.toHash=function(){return String.fromCharCode(this.lo&255,this.lo>>>8&255,this.lo>>>16&255,this.lo>>>24,this.hi&255,this.hi>>>8&255,this.hi>>>16&255,this.hi>>>24)},e.prototype.zzEncode=function(){var n=this.hi>>31;return this.hi=((this.hi<<1|this.lo>>>31)^n)>>>0,this.lo=(this.lo<<1^n)>>>0,this},e.prototype.zzDecode=function(){var n=-(this.lo&1);return this.lo=((this.lo>>>1|this.hi<<31)^n)>>>0,this.hi=(this.hi>>>1^n)>>>0,this},e.prototype.length=function(){var n=this.lo,o=(this.lo>>>28|this.hi<<4)>>>0,t=this.hi>>>24;return t===0?o===0?n<16384?n<128?1:2:n<2097152?3:4:o<16384?o<128?5:6:o<2097152?7:8:t<128?9:10},ze}var Be={exports:{}},Dt;function Gn(){return Dt||(Dt=1,function(s,e){(function(i,c){function u(a){return a.default||a}c(e),s.exports=u(e)})(typeof globalThis<"u"?globalThis:typeof self<"u"?self:_e,function(i){Object.defineProperty(i,"__esModule",{value:!0}),i.default=void 0;/**
 * @license
 * Copyright 2009 The Closure Library Authors
 * Copyright 2020 Daniel Wirtz / The long.js Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */var c=null;try{c=new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0,1,13,2,96,0,1,127,96,4,127,127,127,127,1,127,3,7,6,0,1,1,1,1,1,6,6,1,127,1,65,0,11,7,50,6,3,109,117,108,0,1,5,100,105,118,95,115,0,2,5,100,105,118,95,117,0,3,5,114,101,109,95,115,0,4,5,114,101,109,95,117,0,5,8,103,101,116,95,104,105,103,104,0,0,10,191,1,6,4,0,35,0,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,126,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,127,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,128,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,129,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,130,34,4,66,32,135,167,36,0,32,4,167,11])),{}).exports}catch{}function u(_,h,N){this.low=_|0,this.high=h|0,this.unsigned=!!N}u.prototype.__isLong__,Object.defineProperty(u.prototype,"__isLong__",{value:!0});function a(_){return(_&&_.__isLong__)===!0}function n(_){var h=Math.clz32(_&-_);return _?31-h:h}u.isLong=a;var o={},t={};function r(_,h){var N,P,J;return h?(_>>>=0,(J=0<=_&&_<256)&&(P=t[_],P)?P:(N=f(_,0,!0),J&&(t[_]=N),N)):(_|=0,(J=-128<=_&&_<128)&&(P=o[_],P)?P:(N=f(_,_<0?-1:0,!1),J&&(o[_]=N),N))}u.fromInt=r;function l(_,h){if(isNaN(_))return h?I:R;if(h){if(_<0)return I;if(_>=g)return V}else{if(_<=-A)return j;if(_+1>=A)return q}return _<0?l(-_,h).neg():f(_%T|0,_/T|0,h)}u.fromNumber=l;function f(_,h,N){return new u(_,h,N)}u.fromBits=f;var d=Math.pow;function p(_,h,N){if(_.length===0)throw Error("empty string");if(typeof h=="number"?(N=h,h=!1):h=!!h,_==="NaN"||_==="Infinity"||_==="+Infinity"||_==="-Infinity")return h?I:R;if(N=N||10,N<2||36<N)throw RangeError("radix");var P;if((P=_.indexOf("-"))>0)throw Error("interior hyphen");if(P===0)return p(_.substring(1),h,N).neg();for(var J=l(d(N,8)),U=R,G=0;G<_.length;G+=8){var Q=Math.min(8,_.length-G),ie=parseInt(_.substring(G,G+Q),N);if(Q<8){var $=l(d(N,Q));U=U.mul($).add(l(ie))}else U=U.mul(J),U=U.add(l(ie))}return U.unsigned=h,U}u.fromString=p;function m(_,h){return typeof _=="number"?l(_,h):typeof _=="string"?p(_,h):f(_.low,_.high,typeof h=="boolean"?h:_.unsigned)}u.fromValue=m;var y=65536,S=1<<24,T=y*y,g=T*T,A=g/2,v=r(S),R=r(0);u.ZERO=R;var I=r(0,!0);u.UZERO=I;var L=r(1);u.ONE=L;var W=r(1,!0);u.UONE=W;var B=r(-1);u.NEG_ONE=B;var q=f(-1,2147483647,!1);u.MAX_VALUE=q;var V=f(-1,-1,!0);u.MAX_UNSIGNED_VALUE=V;var j=f(0,-2147483648,!1);u.MIN_VALUE=j;var O=u.prototype;O.toInt=function(){return this.unsigned?this.low>>>0:this.low},O.toNumber=function(){return this.unsigned?(this.high>>>0)*T+(this.low>>>0):this.high*T+(this.low>>>0)},O.toString=function(h){if(h=h||10,h<2||36<h)throw RangeError("radix");if(this.isZero())return"0";if(this.isNegative())if(this.eq(j)){var N=l(h),P=this.div(N),J=P.mul(N).sub(this);return P.toString(h)+J.toInt().toString(h)}else return"-"+this.neg().toString(h);for(var U=l(d(h,6),this.unsigned),G=this,Q="";;){var ie=G.div(U),$=G.sub(ie.mul(U)).toInt()>>>0,H=$.toString(h);if(G=ie,G.isZero())return H+Q;for(;H.length<6;)H="0"+H;Q=""+H+Q}},O.getHighBits=function(){return this.high},O.getHighBitsUnsigned=function(){return this.high>>>0},O.getLowBits=function(){return this.low},O.getLowBitsUnsigned=function(){return this.low>>>0},O.getNumBitsAbs=function(){if(this.isNegative())return this.eq(j)?64:this.neg().getNumBitsAbs();for(var h=this.high!=0?this.high:this.low,N=31;N>0&&!(h&1<<N);N--);return this.high!=0?N+33:N+1},O.isSafeInteger=function(){var h=this.high>>21;return h?this.unsigned?!1:h===-1&&!(this.low===0&&this.high===-2097152):!0},O.isZero=function(){return this.high===0&&this.low===0},O.eqz=O.isZero,O.isNegative=function(){return!this.unsigned&&this.high<0},O.isPositive=function(){return this.unsigned||this.high>=0},O.isOdd=function(){return(this.low&1)===1},O.isEven=function(){return(this.low&1)===0},O.equals=function(h){return a(h)||(h=m(h)),this.unsigned!==h.unsigned&&this.high>>>31===1&&h.high>>>31===1?!1:this.high===h.high&&this.low===h.low},O.eq=O.equals,O.notEquals=function(h){return!this.eq(h)},O.neq=O.notEquals,O.ne=O.notEquals,O.lessThan=function(h){return this.comp(h)<0},O.lt=O.lessThan,O.lessThanOrEqual=function(h){return this.comp(h)<=0},O.lte=O.lessThanOrEqual,O.le=O.lessThanOrEqual,O.greaterThan=function(h){return this.comp(h)>0},O.gt=O.greaterThan,O.greaterThanOrEqual=function(h){return this.comp(h)>=0},O.gte=O.greaterThanOrEqual,O.ge=O.greaterThanOrEqual,O.compare=function(h){if(a(h)||(h=m(h)),this.eq(h))return 0;var N=this.isNegative(),P=h.isNegative();return N&&!P?-1:!N&&P?1:this.unsigned?h.high>>>0>this.high>>>0||h.high===this.high&&h.low>>>0>this.low>>>0?-1:1:this.sub(h).isNegative()?-1:1},O.comp=O.compare,O.negate=function(){return!this.unsigned&&this.eq(j)?j:this.not().add(L)},O.neg=O.negate,O.add=function(h){a(h)||(h=m(h));var N=this.high>>>16,P=this.high&65535,J=this.low>>>16,U=this.low&65535,G=h.high>>>16,Q=h.high&65535,ie=h.low>>>16,$=h.low&65535,H=0,ne=0,K=0,Y=0;return Y+=U+$,K+=Y>>>16,Y&=65535,K+=J+ie,ne+=K>>>16,K&=65535,ne+=P+Q,H+=ne>>>16,ne&=65535,H+=N+G,H&=65535,f(K<<16|Y,H<<16|ne,this.unsigned)},O.subtract=function(h){return a(h)||(h=m(h)),this.add(h.neg())},O.sub=O.subtract,O.multiply=function(h){if(this.isZero())return this;if(a(h)||(h=m(h)),c){var N=c.mul(this.low,this.high,h.low,h.high);return f(N,c.get_high(),this.unsigned)}if(h.isZero())return this.unsigned?I:R;if(this.eq(j))return h.isOdd()?j:R;if(h.eq(j))return this.isOdd()?j:R;if(this.isNegative())return h.isNegative()?this.neg().mul(h.neg()):this.neg().mul(h).neg();if(h.isNegative())return this.mul(h.neg()).neg();if(this.lt(v)&&h.lt(v))return l(this.toNumber()*h.toNumber(),this.unsigned);var P=this.high>>>16,J=this.high&65535,U=this.low>>>16,G=this.low&65535,Q=h.high>>>16,ie=h.high&65535,$=h.low>>>16,H=h.low&65535,ne=0,K=0,Y=0,ke=0;return ke+=G*H,Y+=ke>>>16,ke&=65535,Y+=U*H,K+=Y>>>16,Y&=65535,Y+=G*$,K+=Y>>>16,Y&=65535,K+=J*H,ne+=K>>>16,K&=65535,K+=U*$,ne+=K>>>16,K&=65535,K+=G*ie,ne+=K>>>16,K&=65535,ne+=P*H+J*$+U*ie+G*Q,ne&=65535,f(Y<<16|ke,ne<<16|K,this.unsigned)},O.mul=O.multiply,O.divide=function(h){if(a(h)||(h=m(h)),h.isZero())throw Error("division by zero");if(c){if(!this.unsigned&&this.high===-2147483648&&h.low===-1&&h.high===-1)return this;var N=(this.unsigned?c.div_u:c.div_s)(this.low,this.high,h.low,h.high);return f(N,c.get_high(),this.unsigned)}if(this.isZero())return this.unsigned?I:R;var P,J,U;if(this.unsigned){if(h.unsigned||(h=h.toUnsigned()),h.gt(this))return I;if(h.gt(this.shru(1)))return W;U=I}else{if(this.eq(j)){if(h.eq(L)||h.eq(B))return j;if(h.eq(j))return L;var G=this.shr(1);return P=G.div(h).shl(1),P.eq(R)?h.isNegative()?L:B:(J=this.sub(h.mul(P)),U=P.add(J.div(h)),U)}else if(h.eq(j))return this.unsigned?I:R;if(this.isNegative())return h.isNegative()?this.neg().div(h.neg()):this.neg().div(h).neg();if(h.isNegative())return this.div(h.neg()).neg();U=R}for(J=this;J.gte(h);){P=Math.max(1,Math.floor(J.toNumber()/h.toNumber()));for(var Q=Math.ceil(Math.log(P)/Math.LN2),ie=Q<=48?1:d(2,Q-48),$=l(P),H=$.mul(h);H.isNegative()||H.gt(J);)P-=ie,$=l(P,this.unsigned),H=$.mul(h);$.isZero()&&($=L),U=U.add($),J=J.sub(H)}return U},O.div=O.divide,O.modulo=function(h){if(a(h)||(h=m(h)),c){var N=(this.unsigned?c.rem_u:c.rem_s)(this.low,this.high,h.low,h.high);return f(N,c.get_high(),this.unsigned)}return this.sub(this.div(h).mul(h))},O.mod=O.modulo,O.rem=O.modulo,O.not=function(){return f(~this.low,~this.high,this.unsigned)},O.countLeadingZeros=function(){return this.high?Math.clz32(this.high):Math.clz32(this.low)+32},O.clz=O.countLeadingZeros,O.countTrailingZeros=function(){return this.low?n(this.low):n(this.high)+32},O.ctz=O.countTrailingZeros,O.and=function(h){return a(h)||(h=m(h)),f(this.low&h.low,this.high&h.high,this.unsigned)},O.or=function(h){return a(h)||(h=m(h)),f(this.low|h.low,this.high|h.high,this.unsigned)},O.xor=function(h){return a(h)||(h=m(h)),f(this.low^h.low,this.high^h.high,this.unsigned)},O.shiftLeft=function(h){return a(h)&&(h=h.toInt()),(h&=63)===0?this:h<32?f(this.low<<h,this.high<<h|this.low>>>32-h,this.unsigned):f(0,this.low<<h-32,this.unsigned)},O.shl=O.shiftLeft,O.shiftRight=function(h){return a(h)&&(h=h.toInt()),(h&=63)===0?this:h<32?f(this.low>>>h|this.high<<32-h,this.high>>h,this.unsigned):f(this.high>>h-32,this.high>=0?0:-1,this.unsigned)},O.shr=O.shiftRight,O.shiftRightUnsigned=function(h){return a(h)&&(h=h.toInt()),(h&=63)===0?this:h<32?f(this.low>>>h|this.high<<32-h,this.high>>>h,this.unsigned):h===32?f(this.high,0,this.unsigned):f(this.high>>>h-32,0,this.unsigned)},O.shru=O.shiftRightUnsigned,O.shr_u=O.shiftRightUnsigned,O.rotateLeft=function(h){var N;return a(h)&&(h=h.toInt()),(h&=63)===0?this:h===32?f(this.high,this.low,this.unsigned):h<32?(N=32-h,f(this.low<<h|this.high>>>N,this.high<<h|this.low>>>N,this.unsigned)):(h-=32,N=32-h,f(this.high<<h|this.low>>>N,this.low<<h|this.high>>>N,this.unsigned))},O.rotl=O.rotateLeft,O.rotateRight=function(h){var N;return a(h)&&(h=h.toInt()),(h&=63)===0?this:h===32?f(this.high,this.low,this.unsigned):h<32?(N=32-h,f(this.high<<N|this.low>>>h,this.low<<N|this.high>>>h,this.unsigned)):(h-=32,N=32-h,f(this.low<<N|this.high>>>h,this.high<<N|this.low>>>h,this.unsigned))},O.rotr=O.rotateRight,O.toSigned=function(){return this.unsigned?f(this.low,this.high,!1):this},O.toUnsigned=function(){return this.unsigned?this:f(this.low,this.high,!0)},O.toBytes=function(h){return h?this.toBytesLE():this.toBytesBE()},O.toBytesLE=function(){var h=this.high,N=this.low;return[N&255,N>>>8&255,N>>>16&255,N>>>24,h&255,h>>>8&255,h>>>16&255,h>>>24]},O.toBytesBE=function(){var h=this.high,N=this.low;return[h>>>24,h>>>16&255,h>>>8&255,h&255,N>>>24,N>>>16&255,N>>>8&255,N&255]},u.fromBytes=function(h,N,P){return P?u.fromBytesLE(h,N):u.fromBytesBE(h,N)},u.fromBytesLE=function(h,N){return new u(h[0]|h[1]<<8|h[2]<<16|h[3]<<24,h[4]|h[5]<<8|h[6]<<16|h[7]<<24,N)},u.fromBytesBE=function(h,N){return new u(h[4]<<24|h[5]<<16|h[6]<<8|h[7],h[0]<<24|h[1]<<16|h[2]<<8|h[3],N)},typeof BigInt=="function"&&(u.fromBigInt=function(h,N){var P=Number(BigInt.asIntN(32,h)),J=Number(BigInt.asIntN(32,h>>BigInt(32)));return f(P,J,N)},u.fromValue=function(h,N){return typeof h=="bigint"?u.fromBigInt(h,N):m(h,N)},O.toBigInt=function(){var h=BigInt(this.low>>>0),N=BigInt(this.unsigned?this.high>>>0:this.high);return N<<BigInt(32)|h}),i.default=u})}(Be,Be.exports)),Be.exports}var jt;function de(){return jt||(jt=1,function(s){var e=s;e.asPromise=yn,e.base64=gn,e.EventEmitter=Un,e.float=Jn,e.utf8=vn,e.pool=Wn,e.LongBits=Zn();function i(a){return a==="__proto__"||a==="prototype"||a==="constructor"}e.isUnsafeProperty=i,e.isNode=!!(typeof _e<"u"&&_e&&_e.process&&_e.process.versions&&_e.process.versions.node),e.global=e.isNode&&_e||typeof window<"u"&&window||typeof self<"u"&&self||_e,e.emptyArray=Object.freeze?Object.freeze([]):[],e.emptyObject=Object.freeze?Object.freeze({}):{},e.isInteger=Number.isInteger||function(n){return typeof n=="number"&&isFinite(n)&&Math.floor(n)===n},e.isString=function(n){return typeof n=="string"||n instanceof String},e.isObject=function(n){return n&&typeof n=="object"},e.isset=e.isSet=function(n,o){var t=n[o];return t!=null&&Object.hasOwnProperty.call(n,o)?typeof t!="object"||(Array.isArray(t)?t.length:Object.keys(t).length)>0:!1},e.Buffer=function(){try{var a=e.global.Buffer;return a.prototype.utf8Write?a:null}catch{return null}}(),e._Buffer_from=null,e._Buffer_allocUnsafe=null,e.newBuffer=function(n){return typeof n=="number"?e.Buffer?e._Buffer_allocUnsafe(n):new e.Array(n):e.Buffer?e._Buffer_from(n):typeof Uint8Array>"u"?n:new Uint8Array(n)},e.Array=typeof Uint8Array<"u"?Uint8Array:Array,e.Long=e.global.dcodeIO&&e.global.dcodeIO.Long||e.global.Long||function(){try{var a=Gn();return a&&a.isLong?a:null}catch{return null}}(),e.key2Re=/^true|false|0|1$/,e.key32Re=/^-?(?:0|[1-9][0-9]*)$/,e.key64Re=/^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/,e.longToHash=function(n){return n?e.LongBits.from(n).toHash():e.LongBits.zeroHash},e.longFromHash=function(n,o){var t=e.LongBits.fromHash(n);return e.Long?e.Long.fromBits(t.lo,t.hi,o):t.toNumber(!!o)};function c(a){var n=typeof arguments[arguments.length-1]=="boolean",o=n?arguments.length-1:arguments.length;n=n&&arguments[arguments.length-1];for(var t=1;t<o;++t){var r=arguments[t];if(r)for(var l=Object.keys(r),f=0;f<l.length;++f)!i(l[f])&&(a[l[f]]===void 0||!n)&&(a[l[f]]=r[l[f]])}return a}e.merge=c,e.nestingLimit=32,e.recursionLimit=100,e.makeProp=function(n,o){Object.defineProperty(n,o,{enumerable:!0,configurable:!0,writable:!0})},e.lcFirst=function(n){return n.charAt(0).toLowerCase()+n.substring(1)};function u(a){function n(o,t){if(!(this instanceof n))return new n(o,t);Object.defineProperty(this,"message",{get:function(){return o}}),Error.captureStackTrace?Error.captureStackTrace(this,n):Object.defineProperty(this,"stack",{value:new Error().stack||""}),t&&c(this,t)}return n.prototype=Object.create(Error.prototype,{constructor:{value:n,writable:!0,enumerable:!1,configurable:!0},name:{get:function(){return a},set:void 0,enumerable:!1,configurable:!0},toString:{value:function(){return this.name+": "+this.message},writable:!0,enumerable:!1,configurable:!0}}),n}e.newError=u,e.ProtocolError=u("ProtocolError"),e.oneOfGetter=function(n){for(var o={},t=0;t<n.length;++t)o[n[t]]=1;return function(){for(var r=Object.keys(this),l=r.length-1;l>-1;--l)if(o[r[l]]===1&&this[r[l]]!==void 0&&this[r[l]]!==null)return r[l]}},e.oneOfSetter=function(n){return function(o){for(var t=0;t<n.length;++t)n[t]!==o&&delete this[n[t]]}},e.toJSONOptions={longs:String,enums:String,bytes:String,json:!0},e._configure=function(){var a=e.Buffer;if(!a){e._Buffer_from=e._Buffer_allocUnsafe=null;return}e._Buffer_from=a.from!==Uint8Array.from&&a.from||function(o,t){return new a(o,t)},e._Buffer_allocUnsafe=a.allocUnsafe||function(o){return new a(o)}}}(qe)),qe}var ht=z,se=de(),ft,je=se.LongBits,Mt=se.base64,qt=se.utf8;function Fe(s,e,i){this.fn=s,this.len=e,this.next=void 0,this.val=i}function dt(){}function Kn(s){this.head=s.head,this.tail=s.tail,this.len=s.len,this.next=s.states}function z(){this.len=0,this.head=new Fe(dt,0,0),this.tail=this.head,this.states=null}var _n=function(){return se.Buffer?function(){return(z.create=function(){return new ft})()}:function(){return new z}};z.create=_n();z.alloc=function(e){return new se.Array(e)};se.Array!==Array&&(z.alloc=se.pool(z.alloc,se.Array.prototype.subarray));z.prototype._push=function(e,i,c){return this.tail=this.tail.next=new Fe(e,i,c),this.len+=i,this};function pt(s,e,i){e[i]=s&255}function Xn(s,e,i){for(;s>127;)e[i++]=s&127|128,s>>>=7;e[i]=s}function mt(s,e){this.len=s,this.next=void 0,this.val=e}mt.prototype=Object.create(Fe.prototype);mt.prototype.fn=Xn;z.prototype.uint32=function(e){return this.len+=(this.tail=this.tail.next=new mt((e=e>>>0)<128?1:e<16384?2:e<2097152?3:e<268435456?4:5,e)).len,this};z.prototype.int32=function(e){return(e|=0)<0?this._push(yt,10,je.fromNumber(e)):this.uint32(e)};z.prototype.sint32=function(e){return this.uint32((e<<1^e>>31)>>>0)};function yt(s,e,i){for(var c=s.lo,u=s.hi;u;)e[i++]=c&127|128,c=(c>>>7|u<<25)>>>0,u>>>=7;for(;c>127;)e[i++]=c&127|128,c=c>>>7;e[i++]=c}z.prototype.uint64=function(e){var i=je.from(e);return this._push(yt,i.length(),i)};z.prototype.int64=z.prototype.uint64;z.prototype.sint64=function(e){var i=je.from(e).zzEncode();return this._push(yt,i.length(),i)};z.prototype.bool=function(e){return this._push(pt,1,e?1:0)};function lt(s,e,i){e[i]=s&255,e[i+1]=s>>>8&255,e[i+2]=s>>>16&255,e[i+3]=s>>>24}z.prototype.fixed32=function(e){return this._push(lt,4,e>>>0)};z.prototype.sfixed32=z.prototype.fixed32;z.prototype.fixed64=function(e){var i=je.from(e);return this._push(lt,4,i.lo)._push(lt,4,i.hi)};z.prototype.sfixed64=z.prototype.fixed64;z.prototype.float=function(e){return this._push(se.float.writeFloatLE,4,e)};z.prototype.double=function(e){return this._push(se.float.writeDoubleLE,8,e)};var Yn=se.Array.prototype.set?function(e,i,c){i.set(e,c)}:function(e,i,c){for(var u=0;u<e.length;++u)i[c+u]=e[u]};z.prototype.bytes=function(e){var i=e.length>>>0;if(!i)return this._push(pt,1,0);if(se.isString(e)){var c=z.alloc(i=Mt.length(e));Mt.decode(e,c,0),e=c}return this.uint32(i)._push(Yn,i,e)};z.prototype.string=function(e){var i=qt.length(e);return i?this.uint32(i)._push(qt.write,i,e):this._push(pt,1,0)};z.prototype.fork=function(){return this.states=new Kn(this),this.head=this.tail=new Fe(dt,0,0),this.len=0,this};z.prototype.reset=function(){return this.states?(this.head=this.states.head,this.tail=this.states.tail,this.len=this.states.len,this.states=this.states.next):(this.head=this.tail=new Fe(dt,0,0),this.len=0),this};z.prototype.ldelim=function(){var e=this.head,i=this.tail,c=this.len;return this.reset().uint32(c),c&&(this.tail.next=e.next,this.tail=i,this.len+=c),this};z.prototype.finish=function(){for(var e=this.head.next,i=this.constructor.alloc(this.len),c=0;e;)e.fn(e.val,i,c),c+=e.len,e=e.next;return i};z._configure=function(s){ft=s,z.create=_n(),ft._configure()};var Qn=he,bn=ht;(he.prototype=Object.create(bn.prototype)).constructor=he;var be=de();function he(){bn.call(this)}he._configure=function(){he.alloc=be._Buffer_allocUnsafe,he.writeBytesBuffer=be.Buffer&&be.Buffer.prototype instanceof Uint8Array&&be.Buffer.prototype.set.name==="set"?function(e,i,c){i.set(e,c)}:function(e,i,c){if(e.copy)e.copy(i,c,0,e.length);else for(var u=0;u<e.length;)i[c++]=e[u++]}};he.prototype.bytes=function(e){be.isString(e)&&(e=be._Buffer_from(e,"base64"));var i=e.length>>>0;return this.uint32(i),i&&this._push(he.writeBytesBuffer,i,e),this};function er(s,e,i){s.length<40?be.utf8.write(s,e,i):e.utf8Write?e.utf8Write(s,i):e.write(s,i)}he.prototype.string=function(e){var i=be.Buffer.byteLength(e);return this.uint32(i),i&&this._push(er,i,e),this};he._configure();var gt=Z,oe=de(),ct,wn=oe.LongBits,tr=oe.utf8;function ae(s,e){return RangeError("index out of range: "+s.pos+" + "+(e||1)+" > "+s.len)}function Z(s){this.buf=s,this.pos=0,this.len=s.length}var zt=typeof Uint8Array<"u"?function(e){if(e instanceof Uint8Array||Array.isArray(e))return new Z(e);throw Error("illegal buffer")}:function(e){if(Array.isArray(e))return new Z(e);throw Error("illegal buffer")},On=function(){return oe.Buffer?function(i){return(Z.create=function(u){return oe.Buffer.isBuffer(u)?new ct(u):zt(u)})(i)}:zt};Z.create=On();Z.prototype._slice=oe.Array.prototype.subarray||oe.Array.prototype.slice;Z.prototype.uint32=function(){var e=4294967295;return function(){if(e=(this.buf[this.pos]&127)>>>0,this.buf[this.pos++]<128||(e=(e|(this.buf[this.pos]&127)<<7)>>>0,this.buf[this.pos++]<128)||(e=(e|(this.buf[this.pos]&127)<<14)>>>0,this.buf[this.pos++]<128)||(e=(e|(this.buf[this.pos]&127)<<21)>>>0,this.buf[this.pos++]<128)||(e=(e|(this.buf[this.pos]&15)<<28)>>>0,this.buf[this.pos++]<128))return e;if((this.pos+=5)>this.len)throw this.pos=this.len,ae(this,10);return e}}();Z.prototype.int32=function(){return this.uint32()|0};Z.prototype.sint32=function(){var e=this.uint32();return e>>>1^-(e&1)|0};function Ve(){var s=new wn(0,0),e=0;if(this.len-this.pos>4){for(;e<4;++e)if(s.lo=(s.lo|(this.buf[this.pos]&127)<<e*7)>>>0,this.buf[this.pos++]<128)return s;if(s.lo=(s.lo|(this.buf[this.pos]&127)<<28)>>>0,s.hi=(s.hi|(this.buf[this.pos]&127)>>4)>>>0,this.buf[this.pos++]<128)return s;e=0}else{for(;e<3;++e){if(this.pos>=this.len)throw ae(this);if(s.lo=(s.lo|(this.buf[this.pos]&127)<<e*7)>>>0,this.buf[this.pos++]<128)return s}return s.lo=(s.lo|(this.buf[this.pos++]&127)<<e*7)>>>0,s}if(this.len-this.pos>4){for(;e<5;++e)if(s.hi=(s.hi|(this.buf[this.pos]&127)<<e*7+3)>>>0,this.buf[this.pos++]<128)return s}else for(;e<5;++e){if(this.pos>=this.len)throw ae(this);if(s.hi=(s.hi|(this.buf[this.pos]&127)<<e*7+3)>>>0,this.buf[this.pos++]<128)return s}throw Error("invalid varint encoding")}Z.prototype.bool=function(){return this.uint32()!==0};function Pe(s,e){return(s[e-4]|s[e-3]<<8|s[e-2]<<16|s[e-1]<<24)>>>0}Z.prototype.fixed32=function(){if(this.pos+4>this.len)throw ae(this,4);return Pe(this.buf,this.pos+=4)};Z.prototype.sfixed32=function(){if(this.pos+4>this.len)throw ae(this,4);return Pe(this.buf,this.pos+=4)|0};function Vt(){if(this.pos+8>this.len)throw ae(this,8);return new wn(Pe(this.buf,this.pos+=4),Pe(this.buf,this.pos+=4))}Z.prototype.float=function(){if(this.pos+4>this.len)throw ae(this,4);var e=oe.float.readFloatLE(this.buf,this.pos);return this.pos+=4,e};Z.prototype.double=function(){if(this.pos+8>this.len)throw ae(this,4);var e=oe.float.readDoubleLE(this.buf,this.pos);return this.pos+=8,e};Z.prototype.bytes=function(){var e=this.uint32(),i=this.pos,c=this.pos+e;if(c>this.len)throw ae(this,e);if(this.pos+=e,Array.isArray(this.buf))return this.buf.slice(i,c);if(i===c){var u=oe.Buffer;return u?u.alloc(0):new this.buf.constructor(0)}return this._slice.call(this.buf,i,c)};Z.prototype.string=function(){var e=this.bytes();return tr.read(e,0,e.length)};Z.prototype.skip=function(e){if(typeof e=="number"){if(this.pos+e>this.len)throw ae(this,e);this.pos+=e}else do if(this.pos>=this.len)throw ae(this);while(this.buf[this.pos++]&128);return this};Z.recursionLimit=oe.recursionLimit;Z.prototype.skipType=function(s,e){if(e===void 0&&(e=0),e>Z.recursionLimit)throw Error("maximum nesting depth exceeded");switch(s){case 0:this.skip();break;case 1:this.skip(8);break;case 2:this.skip(this.uint32());break;case 3:for(;(s=this.uint32()&7)!==4;)this.skipType(s,e+1);break;case 5:this.skip(4);break;default:throw Error("invalid wire type "+s+" at offset "+this.pos)}return this};Z._configure=function(s){ct=s,Z.create=On(),ct._configure();var e=oe.Long?"toLong":"toNumber";oe.merge(Z.prototype,{int64:function(){return Ve.call(this)[e](!1)},uint64:function(){return Ve.call(this)[e](!0)},sint64:function(){return Ve.call(this).zzDecode()[e](!1)},fixed64:function(){return Vt.call(this)[e](!0)},sfixed64:function(){return Vt.call(this)[e](!1)}})};var nr=xe,xn=gt;(xe.prototype=Object.create(xn.prototype)).constructor=xe;var $t=de();function xe(s){xn.call(this,s)}xe._configure=function(){$t.Buffer&&(xe.prototype._slice=$t.Buffer.prototype.slice)};xe.prototype.string=function(){var e=this.uint32();return this.buf.utf8Slice?this.buf.utf8Slice(this.pos,this.pos=Math.min(this.pos+e,this.len)):this.buf.toString("utf-8",this.pos,this.pos=Math.min(this.pos+e,this.len))};xe._configure();var vt={},rr=Ce,_t=de();(Ce.prototype=Object.create(_t.EventEmitter.prototype)).constructor=Ce;function Ce(s,e,i){if(typeof s!="function")throw TypeError("rpcImpl must be a function");_t.EventEmitter.call(this),this.rpcImpl=s,this.requestDelimited=!!e,this.responseDelimited=!!i}Ce.prototype.rpcCall=function s(e,i,c,u,a){if(!u)throw TypeError("request must be specified");var n=this;if(!a)return _t.asPromise(s,n,e,i,c,u);if(!n.rpcImpl){setTimeout(function(){a(Error("already ended"))},0);return}try{return n.rpcImpl(e,i[n.requestDelimited?"encodeDelimited":"encode"](u).finish(),function(t,r){if(t)return n.emit("error",t,e),a(t);if(r===null){n.end(!0);return}if(!(r instanceof c))try{r=c[n.responseDelimited?"decodeDelimited":"decode"](r)}catch(l){return n.emit("error",l,e),a(l)}return n.emit("data",r,e),a(null,r)})}catch(o){n.emit("error",o,e),setTimeout(function(){a(o)},0);return}};Ce.prototype.end=function(e){return this.rpcImpl&&(e||this.rpcImpl(null,null,null),this.rpcImpl=null,this.emit("end").off()),this};(function(s){var e=s;e.Service=rr})(vt);var En=Object.create(null);(function(s){var e=s;e.build="minimal",e.Writer=ht,e.BufferWriter=Qn,e.Reader=gt,e.BufferReader=nr,e.util=de(),e.rpc=vt,e.roots=En,e.configure=i;function i(){e.util._configure(),e.Writer._configure(e.BufferWriter),e.Reader._configure(e.BufferReader)}i()})(mn);var $e={},Ue={exports:{}},ir=bt,sr=/^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/;function bt(s,e){typeof s=="string"&&(e=s,s=void 0);var i=[];function c(a){if(typeof a!="string"){var n=u();if(bt.verbose&&console.log("codegen: "+n),n="return "+n,a){for(var o=Object.keys(a),t=new Array(o.length+1),r=new Array(o.length),l=0;l<o.length;)t[l]=o[l],r[l]=a[o[l++]];return t[l]=n,Function.apply(null,t).apply(null,r)}return Function(n)()}for(var f=new Array(arguments.length-1),d=0;d<f.length;)f[d]=arguments[++d];if(d=0,a=a.replace(/%([%dfijs])/g,function(m,y){var S=f[d++];switch(y){case"d":case"f":return String(Number(S));case"i":return String(Math.floor(S));case"j":return JSON.stringify(S);case"s":return String(S)}return"%"}),d!==f.length)throw Error("parameter count mismatch");return i.push(a),c}function u(a){return"function "+or(a||e)+"("+(s&&s.join(",")||"")+`){
  `+i.join(`
  `)+`
}`}return c.toString=u,c}bt.verbose=!1;function or(s){return!s||(s=String(s).replace(/[^\w$]/g,""),!s)?"":(/^\d/.test(s)&&(s="_"+s),sr.test(s)?s+"_":s)}const ar={},ur=Object.freeze(Object.defineProperty({__proto__:null,default:ar},Symbol.toStringTag,{value:"Module"})),An=zn(ur);var Ne=null;try{Ne=An,(!Ne||!Ne.readFile||!Ne.readFileSync)&&(Ne=null)}catch{}var fr=Ne,lr=Se,cr=yn,Je=fr;function Se(s,e,i){return typeof e=="function"?(i=e,e={}):e||(e={}),i?!e.xhr&&Je&&Je.readFile?Je.readFile(s,function(u,a){return u&&typeof XMLHttpRequest<"u"?Se.xhr(s,e,i):u?i(u):i(null,e.binary?a:a.toString("utf8"))}):Se.xhr(s,e,i):cr(Se,this,s,e)}Se.xhr=function(e,i,c){var u=new XMLHttpRequest;u.onreadystatechange=function(){if(u.readyState===4){if(u.status!==0&&u.status!==200)return c(Error("status "+u.status));if(i.binary){var n=u.response;if(!n){n=[];for(var o=0;o<u.responseText.length;++o)n.push(u.responseText.charCodeAt(o)&255)}return c(null,typeof Uint8Array<"u"?new Uint8Array(n):n)}return c(null,u.responseText)}},i.binary&&("overrideMimeType"in u&&u.overrideMimeType("text/plain; charset=x-user-defined"),u.responseType="arraybuffer"),u.open("GET",e),u.send()};var kn={};(function(s){var e=s,i=e.isAbsolute=function(a){return/^(?:\/|\w+:)/.test(a)},c=e.normalize=function(a){a=a.replace(/\\/g,"/").replace(/\/{2,}/g,"/");var n=a.split("/"),o=i(a),t="";o&&(t=n.shift()+"/");for(var r=0;r<n.length;)n[r]===".."?r>0&&n[r-1]!==".."?n.splice(--r,2):o?n.splice(r,1):++r:n[r]==="."?n.splice(r,1):++r;return t+n.join("/")};e.resolve=function(a,n,o){return o||(n=c(n)),i(n)?n:(o||(a=c(a)),(a=a.replace(/(?:\/|^)[^/]+$/,"")).length?c(a+"/"+n):n)}})(kn);var Nn={};(function(s){var e=s;e.numberRe=/^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/,e.typeRefRe=/^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)(?:\.[a-zA-Z_][a-zA-Z_0-9]*)*$/,e.reservedRe=/^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/})(Nn);var Te=null;try{Te=An,(!Te||!Te.readFile||!Te.readFileSync)&&(Te=null)}catch{}var hr=Te,We,Ut;function Le(){if(Ut)return We;Ut=1,We=t;var s=Ae();((t.prototype=Object.create(s.prototype)).constructor=t).className="Namespace";var e=Ee(),i=te(),c=Ie(),u,a,n;t.fromJSON=function(f,d,p){return p=i.checkDepth(p),new t(f,d.options).addJSON(d.nested,p)};function o(l,f){if(l&&l.length){for(var d={},p=0;p<l.length;++p)d[l[p].name]=l[p].toJSON(f);return d}}t.arrayToJSON=o,t.isReservedId=function(f,d){if(f){for(var p=0;p<f.length;++p)if(typeof f[p]!="string"&&f[p][0]<=d&&f[p][1]>d)return!0}return!1},t.isReservedName=function(f,d){if(f){for(var p=0;p<f.length;++p)if(f[p]===d)return!0}return!1};function t(l,f){s.call(this,l,f),this.nested=void 0,this._nestedArray=null,this._lookupCache=Object.create(null),this._needsRecursiveFeatureResolution=!0,this._needsRecursiveResolve=!0}function r(l){l._nestedArray=null,l._lookupCache=Object.create(null);for(var f=l;f=f.parent;)f._lookupCache=Object.create(null);return l}return Object.defineProperty(t.prototype,"nestedArray",{get:function(){return this._nestedArray||(this._nestedArray=i.toArray(this.nested))}}),t.prototype.toJSON=function(f){return i.toObject(["options",this.options,"nested",o(this.nestedArray,f)])},t.prototype.addJSON=function(f,d){d=i.checkDepth(d);var p=this;if(f)for(var m=Object.keys(f),y=0,S;y<m.length;++y)S=f[m[y]],p.add((S.fields!==void 0?u.fromJSON:S.values!==void 0?n.fromJSON:S.methods!==void 0?a.fromJSON:S.id!==void 0?e.fromJSON:t.fromJSON)(m[y],S,d+1));return this},t.prototype.get=function(f){return this.nested&&Object.prototype.hasOwnProperty.call(this.nested,f)?this.nested[f]:null},t.prototype.getEnum=function(f){if(this.nested&&Object.prototype.hasOwnProperty.call(this.nested,f)&&this.nested[f]instanceof n)return this.nested[f].values;throw Error("no such enum: "+f)},t.prototype.add=function(f){if(!(f instanceof e&&f.extend!==void 0||f instanceof u||f instanceof c||f instanceof n||f instanceof a||f instanceof t))throw TypeError("object must be a valid nested object");if(f.name==="__proto__")return this;if(!this.nested)this.nested={};else{var d=this.get(f.name);if(d)if(d instanceof t&&f instanceof t&&!(d instanceof u||d instanceof a)){for(var p=d.nestedArray,m=0;m<p.length;++m)f.add(p[m]);this.remove(d),this.nested||(this.nested={}),f.setOptions(d.options,!0)}else throw Error("duplicate name '"+f.name+"' in "+this)}this.nested[f.name]=f,this instanceof u||this instanceof a||this instanceof n||this instanceof e||f._edition||(f._edition=f._defaultEdition),this._needsRecursiveFeatureResolution=!0,this._needsRecursiveResolve=!0;for(var y=this;y=y.parent;)y._needsRecursiveFeatureResolution=!0,y._needsRecursiveResolve=!0;return f.onAdd(this),r(this)},t.prototype.remove=function(f){if(!(f instanceof s))throw TypeError("object must be a ReflectionObject");if(f.parent!==this)throw Error(f+" is not a member of "+this);return delete this.nested[f.name],Object.keys(this.nested).length||(this.nested=void 0),f.onRemove(this),r(this)},t.prototype.define=function(f,d){if(i.isString(f))f=f.split(".");else if(!Array.isArray(f))throw TypeError("illegal path");if(f&&f.length&&f[0]==="")throw Error("path must be relative");if(f.length>i.recursionLimit)throw Error("max depth exceeded");for(var p=this;f.length>0;){var m=f.shift();if(p.nested&&p.nested[m]){if(p=p.nested[m],!(p instanceof t))throw Error("path conflicts with non-namespace objects")}else p.add(p=new t(m))}return d&&p.addJSON(d),p},t.prototype.resolveAll=function(){if(!this._needsRecursiveResolve)return this;this._resolveFeaturesRecursive(this._edition);var f=this.nestedArray,d=0;for(this.resolve();d<f.length;)f[d]instanceof t?f[d++].resolveAll():f[d++].resolve();return this._needsRecursiveResolve=!1,this},t.prototype._resolveFeaturesRecursive=function(f){return this._needsRecursiveFeatureResolution?(this._needsRecursiveFeatureResolution=!1,f=this._edition||f,s.prototype._resolveFeaturesRecursive.call(this,f),this.nestedArray.forEach(d=>{d._resolveFeaturesRecursive(f)}),this):this},t.prototype.lookup=function(f,d,p){if(typeof d=="boolean"?(p=d,d=void 0):d&&!Array.isArray(d)&&(d=[d]),i.isString(f)&&f.length){if(f===".")return this.root;f=f.split(".")}else if(!f.length)return this;var m=f.join(".");if(f[0]==="")return this.root.lookup(f.slice(1),d);var y=this.root._fullyQualifiedObjects&&this.root._fullyQualifiedObjects["."+m];if(y&&(!d||d.indexOf(y.constructor)>-1)||(y=this._lookupImpl(f,m),y&&(!d||d.indexOf(y.constructor)>-1)))return y;if(p)return null;for(var S=this;S.parent;){if(y=S.parent._lookupImpl(f,m),y&&(!d||d.indexOf(y.constructor)>-1))return y;S=S.parent}return null},t.prototype._lookupImpl=function(f,d){if(Object.prototype.hasOwnProperty.call(this._lookupCache,d))return this._lookupCache[d];var p=this.get(f[0]),m=null;if(p)f.length===1?m=p:p instanceof t&&(f=f.slice(1),m=p._lookupImpl(f,f.join(".")));else for(var y=0;y<this.nestedArray.length;++y)if(this._nestedArray[y]instanceof t&&(p=this._nestedArray[y]._lookupImpl(f,d))){m=p;break}return this._lookupCache[d]=m,m},t.prototype.lookupType=function(f){var d=this.lookup(f,[u]);if(!d)throw Error("no such type: "+f);return d},t.prototype.lookupEnum=function(f){var d=this.lookup(f,[n]);if(!d)throw Error("no such Enum '"+f+"' in "+this);return d},t.prototype.lookupTypeOrEnum=function(f){var d=this.lookup(f,[u,n]);if(!d)throw Error("no such Type or Enum '"+f+"' in "+this);return d},t.prototype.lookupService=function(f){var d=this.lookup(f,[a]);if(!d)throw Error("no such Service '"+f+"' in "+this);return d},t._configure=function(l,f,d){u=l,a=f,n=d},We}var He,Jt;function wt(){if(Jt)return He;Jt=1,He=c;var s=Ee();((c.prototype=Object.create(s.prototype)).constructor=c).className="MapField";var e=Re(),i=te();function c(u,a,n,o,t,r){if(s.call(this,u,a,o,void 0,void 0,t,r),!i.isString(n))throw TypeError("keyType must be a string");this.keyType=n,this.resolvedKeyType=null,this.map=!0}return c.fromJSON=function(a,n){return new c(a,n.id,n.keyType,n.type,n.options,n.comment)},c.prototype.toJSON=function(a){var n=a?!!a.keepComments:!1;return i.toObject(["keyType",this.keyType,"type",this.type,"id",this.id,"extend",this.extend,"options",this.options,"comment",n?this.comment:void 0])},c.prototype.resolve=function(){if(this.resolved)return this;if(e.mapKey[this.keyType]===void 0)throw Error("invalid key type: "+this.keyType);return s.prototype.resolve.call(this)},c.d=function(a,n,o){return typeof o=="function"?o=i.decorateType(o).name:o&&typeof o=="object"&&(o=i.decorateEnum(o).name),function(r,l){i.decorateType(r.constructor).add(new c(l,a,n,o))}},He}var Ze,Wt;function Ot(){if(Wt)return Ze;Wt=1,Ze=i;var s=Ae();((i.prototype=Object.create(s.prototype)).constructor=i).className="Method";var e=te();function i(c,u,a,n,o,t,r,l,f){if(e.isObject(o)?(r=o,o=t=void 0):e.isObject(t)&&(r=t,t=void 0),!(u===void 0||e.isString(u)))throw TypeError("type must be a string");if(!e.isString(a))throw TypeError("requestType must be a string");if(!e.isString(n))throw TypeError("responseType must be a string");s.call(this,c,r),this.type=u||"rpc",this.requestType=a,this.requestStream=o?!0:void 0,this.responseType=n,this.responseStream=t?!0:void 0,this.resolvedRequestType=null,this.resolvedResponseType=null,this.comment=l,this.parsedOptions=f}return i.fromJSON=function(u,a){return new i(u,a.type,a.requestType,a.responseType,a.requestStream,a.responseStream,a.options,a.comment,a.parsedOptions)},i.prototype.toJSON=function(u){var a=u?!!u.keepComments:!1;return e.toObject(["type",this.type!=="rpc"&&this.type||void 0,"requestType",this.requestType,"requestStream",this.requestStream,"responseType",this.responseType,"responseStream",this.responseStream,"options",this.options,"comment",a?this.comment:void 0,"parsedOptions",this.parsedOptions])},i.prototype.resolve=function(){return this.resolved?this:(this.resolvedRequestType=this.parent.lookupType(this.requestType),this.resolvedResponseType=this.parent.lookupType(this.responseType),s.prototype.resolve.call(this))},Ze}var Ge,Ht;function xt(){if(Ht)return Ge;Ht=1,Ge=u;var s=Le();((u.prototype=Object.create(s.prototype)).constructor=u).className="Service";var e=Ot(),i=te(),c=vt;function u(n,o){s.call(this,n,o),this.methods={},this._methodsArray=null}u.fromJSON=function(o,t,r){r=i.checkDepth(r);var l=new u(o,t.options);if(t.methods)for(var f=Object.keys(t.methods),d=0;d<f.length;++d)l.add(e.fromJSON(f[d],t.methods[f[d]]));return t.nested&&l.addJSON(t.nested,r),t.edition&&(l._edition=t.edition),l.comment=t.comment,l._defaultEdition="proto3",l},u.prototype.toJSON=function(o){var t=s.prototype.toJSON.call(this,o),r=o?!!o.keepComments:!1;return i.toObject(["edition",this._editionToJSON(),"options",t&&t.options||void 0,"methods",s.arrayToJSON(this.methodsArray,o)||{},"nested",t&&t.nested||void 0,"comment",r?this.comment:void 0])},Object.defineProperty(u.prototype,"methodsArray",{get:function(){return this._methodsArray||(this._methodsArray=i.toArray(this.methods))}});function a(n){return n._methodsArray=null,n}return u.prototype.get=function(o){return Object.prototype.hasOwnProperty.call(this.methods,o)?this.methods[o]:s.prototype.get.call(this,o)},u.prototype.resolveAll=function(){if(!this._needsRecursiveResolve)return this;s.prototype.resolve.call(this);for(var o=this.methodsArray,t=0;t<o.length;++t)o[t].resolve();return this},u.prototype._resolveFeaturesRecursive=function(o){return this._needsRecursiveFeatureResolution?(o=this._edition||o,s.prototype._resolveFeaturesRecursive.call(this,o),this.methodsArray.forEach(t=>{t._resolveFeaturesRecursive(o)}),this):this},u.prototype.add=function(o){if(this.get(o.name))throw Error("duplicate name '"+o.name+"' in "+this);return o instanceof e?o.name==="__proto__"?this:(this.methods[o.name]=o,o.parent=this,a(this)):s.prototype.add.call(this,o)},u.prototype.remove=function(o){if(o instanceof e){if(this.methods[o.name]!==o)throw Error(o+" is not a member of "+this);return delete this.methods[o.name],o.parent=null,a(this)}return s.prototype.remove.call(this,o)},u.prototype.create=function(o,t,r){for(var l=new c.Service(o,t,r),f=0,d;f<this.methodsArray.length;++f){var p=i.lcFirst((d=this._methodsArray[f]).resolve().name).replace(/[^$\w_]/g,"");l[p]=function(m,y,S){return function(g,A){return c.Service.prototype.rpcCall.call(this,m,y,S,g,A)}}(d,d.resolvedRequestType.ctor,d.resolvedResponseType.ctor)}return l},Ge}var Et=pe,dr=de();function pe(s){if(s)for(var e=Object.keys(s),i=0;i<e.length;++i){var c=e[i];c!=="__proto__"&&(this[c]=s[c])}}pe.create=function(e){return this.$type.create(e)};pe.encode=function(e,i){return this.$type.encode(e,i)};pe.encodeDelimited=function(e,i){return this.$type.encodeDelimited(e,i)};pe.decode=function(e){return this.$type.decode(e)};pe.decodeDelimited=function(e){return this.$type.decodeDelimited(e)};pe.verify=function(e){return this.$type.verify(e)};pe.fromObject=function(e){return this.$type.fromObject(e)};pe.toObject=function(e,i){return this.$type.toObject(e,i)};pe.prototype.toJSON=function(){return this.$type.toObject(this,dr.toJSONOptions)};var Ke,Zt;function Tn(){if(Zt)return Ke;Zt=1,Ke=u;var s=me(),e=Re(),i=te();function c(a){return"missing required '"+a.name+"'"}function u(a){for(var n=i.codegen(["r","l","e","n"],a.name+"$decode")("if(!(r instanceof Reader))")("r=Reader.create(r)")("if(n===undefined)n=0")("if(n>Reader.recursionLimit)")('throw Error("maximum nesting depth exceeded")')("var c=l===undefined?r.len:r.pos+l,m=new this.ctor"+(a.fieldsArray.filter(function(d){return d.map}).length?",k,value":""))("while(r.pos<c){")("var t=r.uint32()")("if(t===e)")("break")("switch(t>>>3){"),o=0;o<a.fieldsArray.length;++o){var t=a._fieldsArray[o].resolve(),r=t.resolvedType instanceof s?"int32":t.type,l="m"+i.safeProp(t.name);n("case %i: {",t.id),t.map?(n("if(%s===util.emptyObject)",l)("%s={}",l)("var c2 = r.uint32()+r.pos"),e.defaults[t.keyType]!==void 0?n("k=%j",e.defaults[t.keyType]):n("k=null"),e.defaults[r]!==void 0?n("value=%j",e.defaults[r]):n("value=null"),n("while(r.pos<c2){")("var tag2=r.uint32()")("switch(tag2>>>3){")("case 1: k=r.%s(); break",t.keyType)("case 2:"),e.basic[r]===void 0?n("value=types[%i].decode(r,r.uint32(),undefined,n+1)",o):n("value=r.%s()",r),n("break")("default:")("r.skipType(tag2&7,n)")("break")("}")("}"),e.long[t.keyType]!==void 0?n('%s[typeof k==="object"?util.longToHash(k):k]=value',l):(t.keyType==="string"&&n('if(k==="__proto__")')("util.makeProp(%s,k)",l),n("%s[k]=value",l))):t.repeated?(n("if(!(%s&&%s.length))",l,l)("%s=[]",l),e.packed[r]!==void 0&&n("if((t&7)===2){")("var c2=r.uint32()+r.pos")("while(r.pos<c2)")("%s.push(r.%s())",l,r)("}else"),e.basic[r]===void 0?n(t.delimited?"%s.push(types[%i].decode(r,undefined,((t&~7)|4),n+1))":"%s.push(types[%i].decode(r,r.uint32(),undefined,n+1))",l,o):n("%s.push(r.%s())",l,r)):e.basic[r]===void 0?n(t.delimited?"%s=types[%i].decode(r,undefined,((t&~7)|4),n+1)":"%s=types[%i].decode(r,r.uint32(),undefined,n+1)",l,o):n("%s=r.%s()",l,r),n("break")("}")}for(n("default:")("r.skipType(t&7,n)")("break")("}")("}"),o=0;o<a._fieldsArray.length;++o){var f=a._fieldsArray[o];f.required&&n("if(!Object.hasOwnProperty.call(m,%j))",f.name)("throw util.ProtocolError(%j,{instance:m})",c(f))}return n("return m")}return Ke}var Xe,Gt;function Rn(){if(Gt)return Xe;Gt=1,Xe=a;var s=me(),e=te();function i(n,o){return n.name+": "+o+(n.repeated&&o!=="array"?"[]":n.map&&o!=="object"?"{k:"+n.keyType+"}":"")+" expected"}function c(n,o,t,r){if(o.resolvedType)if(o.resolvedType instanceof s){n("switch(%s){",r)("default:")("return%j",i(o,"enum value"));for(var l=Object.keys(o.resolvedType.values),f=0;f<l.length;++f)n("case %i:",o.resolvedType.values[l[f]]);n("break")("}")}else n("{")("var e=types[%i].verify(%s,n+1);",t,r)("if(e)")("return%j+e",o.name+".")("}");else switch(o.type){case"int32":case"uint32":case"sint32":case"fixed32":case"sfixed32":n("if(!util.isInteger(%s))",r)("return%j",i(o,"integer"));break;case"int64":case"uint64":case"sint64":case"fixed64":case"sfixed64":n("if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))",r,r,r,r)("return%j",i(o,"integer|Long"));break;case"float":case"double":n('if(typeof %s!=="number")',r)("return%j",i(o,"number"));break;case"bool":n('if(typeof %s!=="boolean")',r)("return%j",i(o,"boolean"));break;case"string":n("if(!util.isString(%s))",r)("return%j",i(o,"string"));break;case"bytes":n('if(!(%s&&typeof %s.length==="number"||util.isString(%s)))',r,r,r)("return%j",i(o,"buffer"));break}return n}function u(n,o,t){switch(o.keyType){case"int32":case"uint32":case"sint32":case"fixed32":case"sfixed32":n("if(!util.key32Re.test(%s))",t)("return%j",i(o,"integer key"));break;case"int64":case"uint64":case"sint64":case"fixed64":case"sfixed64":n("if(!util.key64Re.test(%s))",t)("return%j",i(o,"integer|Long key"));break;case"bool":n("if(!util.key2Re.test(%s))",t)("return%j",i(o,"boolean key"));break}return n}function a(n){var o=e.codegen(["m","n"],n.name+"$verify")('if(typeof m!=="object"||m===null)')("return%j","object expected")("if(n===undefined)n=0")("if(n>util.recursionLimit)")("return%j","maximum nesting depth exceeded"),t=n.oneofsArray,r={};t.length&&o("var p={}");for(var l=0;l<n.fieldsArray.length;++l){var f=n._fieldsArray[l].resolve(),d="m"+e.safeProp(f.name);if(f.optional&&o("if(%s!=null&&Object.hasOwnProperty.call(m,%j)){",d,f.name),f.map)o("if(!util.isObject(%s))",d)("return%j",i(f,"object"))("var k=Object.keys(%s)",d)("for(var i=0;i<k.length;++i){"),u(o,f,"k[i]"),c(o,f,l,d+"[k[i]]")("}");else if(f.repeated)o("if(!Array.isArray(%s))",d)("return%j",i(f,"array"))("for(var i=0;i<%s.length;++i){",d),c(o,f,l,d+"[i]")("}");else{if(f.partOf){var p=e.safeProp(f.partOf.name);r[f.partOf.name]===1&&o("if(p%s===1)",p)("return%j",f.partOf.name+": multiple values"),r[f.partOf.name]=1,o("p%s=1",p)}c(o,f,l,d)}f.optional&&o("}")}return o("return null")}return Xe}var Ye={},Kt;function In(){return Kt||(Kt=1,function(s){var e=s,i=me(),c=te();function u(n,o,t,r){var l=!1;if(o.resolvedType)if(o.resolvedType instanceof i){n("switch(d%s){",r);for(var f=o.resolvedType.values,d=Object.keys(f),p=0;p<d.length;++p)f[d[p]]===o.typeDefault&&!l&&(n("default:")('if(typeof(d%s)==="number"){m%s=d%s;break}',r,r,r),o.repeated||n("break"),l=!0),n("case%j:",d[p])("case %i:",f[d[p]])("m%s=%j",r,f[d[p]])("break");n("}")}else n("if(!util.isObject(d%s))",r)("throw TypeError(%j)",o.fullName+": object expected")("m%s=types[%i].fromObject(d%s,n+1)",r,t,r);else{var m=!1;switch(o.type){case"double":case"float":n("m%s=Number(d%s)",r,r);break;case"uint32":case"fixed32":n("m%s=d%s>>>0",r,r);break;case"int32":case"sint32":case"sfixed32":n("m%s=d%s|0",r,r);break;case"uint64":case"fixed64":m=!0;case"int64":case"sint64":case"sfixed64":n("if(util.Long)")("m%s=util.Long.fromValue(d%s,%j)",r,r,m)('else if(typeof d%s==="string")',r)("m%s=parseInt(d%s,10)",r,r)('else if(typeof d%s==="number")',r)("m%s=d%s",r,r)('else if(typeof d%s==="object")',r)("m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)",r,r,r,m?"true":"");break;case"bytes":n('if(typeof d%s==="string")',r)("util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)",r,r,r)("else if(d%s.length >= 0)",r)("m%s=d%s",r,r);break;case"string":n("m%s=String(d%s)",r,r);break;case"bool":n("m%s=Boolean(d%s)",r,r);break}}return n}e.fromObject=function(o){var t=o.fieldsArray,r=c.codegen(["d","n"],o.name+"$fromObject")("if(d instanceof this.ctor)")("return d");if(!t.length)return r("return new this.ctor");r("if(!util.isObject(d))")("throw TypeError(%j)",o.fullName+": object expected")("if(n===undefined)n=0")("if(n>util.recursionLimit)")('throw Error("maximum nesting depth exceeded")'),r("var m=new this.ctor");for(var l=0;l<t.length;++l){var f=t[l].resolve(),d=c.safeProp(f.name);f.map?(r("if(d%s){",d)("if(!util.isObject(d%s))",d)("throw TypeError(%j)",f.fullName+": object expected")("m%s={}",d)("for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){",d),r('if(ks[i]==="__proto__")')("util.makeProp(m%s,ks[i])",d),u(r,f,l,d+"[ks[i]]")("}")("}")):f.repeated?(r("if(d%s){",d)("if(!Array.isArray(d%s))",d)("throw TypeError(%j)",f.fullName+": array expected")("m%s=[]",d)("for(var i=0;i<d%s.length;++i){",d),u(r,f,l,d+"[i]")("}")("}")):(f.resolvedType instanceof i||r("if(d%s!=null){",d),u(r,f,l,d),f.resolvedType instanceof i||r("}"))}return r("return m")};function a(n,o,t,r){if(o.resolvedType)o.resolvedType instanceof i?n("d%s=o.enums===String?(types[%i].values[m%s]===undefined?m%s:types[%i].values[m%s]):m%s",r,t,r,r,t,r,r):n("d%s=types[%i].toObject(m%s,o,q+1)",r,t,r);else{var l=!1;switch(o.type){case"double":case"float":n("d%s=o.json&&!isFinite(m%s)?String(m%s):m%s",r,r,r,r);break;case"uint64":case"fixed64":l=!0;case"int64":case"sint64":case"sfixed64":n('if(typeof BigInt!=="undefined"&&o.longs===BigInt)')('d%s=typeof m%s==="number"?BigInt(m%s):util.Long.fromBits(m%s.low>>>0,m%s.high>>>0,%j).toBigInt()',r,r,r,r,r,l)('else if(typeof m%s==="number")',r)("d%s=o.longs===String?String(m%s):m%s",r,r,r)("else")("d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s",r,r,r,r,l?"true":"",r);break;case"bytes":n("d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s",r,r,r,r,r);break;default:n("d%s=m%s",r,r);break}}return n}e.toObject=function(o){var t=o.fieldsArray.slice().sort(c.compareFieldsById);if(!t.length)return c.codegen()("return {}");for(var r=c.codegen(["m","o","q"],o.name+"$toObject")("if(!o)")("o={}")("if(q===undefined)q=0")("if(q>util.recursionLimit)")('throw Error("max depth exceeded")')("var d={}"),l=[],f=[],d=[],p=0;p<t.length;++p)t[p].partOf||(t[p].resolve().repeated?l:t[p].map?f:d).push(t[p]);if(l.length){for(r("if(o.arrays||o.defaults){"),p=0;p<l.length;++p)r("d%s=[]",c.safeProp(l[p].name));r("}")}if(f.length){for(r("if(o.objects||o.defaults){"),p=0;p<f.length;++p)r("d%s={}",c.safeProp(f[p].name));r("}")}if(d.length){for(r("if(o.defaults){"),p=0;p<d.length;++p){var m=d[p],y=c.safeProp(m.name);if(m.resolvedType instanceof i)r("d%s=o.enums===String?%j:%j",y,m.resolvedType.valuesById[m.typeDefault],m.typeDefault);else if(m.long)r("if(util.Long){")("var n=new util.Long(%i,%i,%j)",m.typeDefault.low,m.typeDefault.high,m.typeDefault.unsigned)('d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():typeof BigInt!=="undefined"&&o.longs===BigInt?n.toBigInt():n',y)("}else")('d%s=o.longs===String?%j:typeof BigInt!=="undefined"&&o.longs===BigInt?BigInt(%j):%i',y,m.typeDefault.toString(),m.typeDefault.toString(),m.typeDefault.toNumber());else if(m.bytes){var S=Array.prototype.slice.call(m.typeDefault);r("if(o.bytes===String)d%s=%j",y,String.fromCharCode.apply(String,m.typeDefault))("else{")("d%s=%j",y,S)("if(o.bytes!==Array)d%s=util.newBuffer(d%s)",y,y)("}")}else r("d%s=%j",y,m.typeDefault)}r("}")}var T=!1;for(p=0;p<t.length;++p){var m=t[p],g=o._fieldsArray.indexOf(m),y=c.safeProp(m.name);m.map?(T||(T=!0,r("var ks2")),r("if(m%s&&(ks2=Object.keys(m%s)).length){",y,y)("d%s={}",y)("for(var j=0;j<ks2.length;++j){"),r('if(ks2[j]==="__proto__")')("util.makeProp(d%s,ks2[j])",y),a(r,m,g,y+"[ks2[j]]")("}")):m.repeated?(r("if(m%s&&m%s.length){",y,y)("d%s=[]",y)("for(var j=0;j<m%s.length;++j){",y),a(r,m,g,y+"[j]")("}")):(r("if(m%s!=null&&Object.hasOwnProperty.call(m,%j)){",y,m.name),a(r,m,g,y),m.partOf&&r("if(o.oneofs)")("d%s=%j",c.safeProp(m.partOf.name),m.name)),r("}")}return r("return d")}}(Ye)),Ye}var At={};(function(s){var e=s,i=Et,c=de();e[".google.protobuf.Any"]={fromObject:function(u,a){if(u&&u["@type"]){var n=u["@type"].substring(u["@type"].lastIndexOf("/")+1),o=this.lookup(n);if(o){var t=u["@type"].charAt(0)==="."?u["@type"].slice(1):u["@type"];return t.indexOf("/")===-1&&(t="/"+t),this.create({type_url:t,value:o.encode(o.fromObject(u,a===void 0?1:a+1)).finish()})}}return this.fromObject(u,a)},toObject:function(u,a,n){if(n===void 0&&(n=0),n>c.recursionLimit)throw Error("max depth exceeded");var o="type.googleapis.com/",t="",r="";if(a&&a.json&&u.type_url&&u.value){r=u.type_url.substring(u.type_url.lastIndexOf("/")+1),t=u.type_url.substring(0,u.type_url.lastIndexOf("/")+1);var l=this.lookup(r);l&&(u=l.decode(u.value,void 0,void 0,n+1))}if(!(u instanceof this.ctor)&&u instanceof i){var f=u.$type.toObject(u,a,n+1),d=u.$type.fullName[0]==="."?u.$type.fullName.slice(1):u.$type.fullName;return t===""&&(t=o),r=t+d,f["@type"]=r,f}return this.toObject(u,a,n)}}})(At);var Qe,Xt;function kt(){if(Xt)return Qe;Xt=1,Qe=y;var s=Le();((y.prototype=Object.create(s.prototype)).constructor=y).className="Type";var e=me(),i=Ie(),c=Ee(),u=wt(),a=xt(),n=Et,o=gt,t=ht,r=te(),l=Sn(),f=Tn(),d=Rn(),p=In(),m=At;function y(T,g){T=T.replace(/\W/g,""),s.call(this,T,g),this.fields={},this.oneofs=void 0,this.extensions=void 0,this.reserved=void 0,this.group=void 0,this._fieldsById=null,this._fieldsArray=null,this._oneofsArray=null,this._ctor=null}Object.defineProperties(y.prototype,{fieldsById:{get:function(){if(this._fieldsById)return this._fieldsById;this._fieldsById={};for(var T=Object.keys(this.fields),g=0;g<T.length;++g){var A=this.fields[T[g]],v=A.id;if(this._fieldsById[v])throw Error("duplicate id "+v+" in "+this);this._fieldsById[v]=A}return this._fieldsById}},fieldsArray:{get:function(){return this._fieldsArray||(this._fieldsArray=r.toArray(this.fields))}},oneofsArray:{get:function(){return this._oneofsArray||(this._oneofsArray=r.toArray(this.oneofs))}},ctor:{get:function(){return this._ctor||(this.ctor=y.generateConstructor(this)())},set:function(T){var g=T.prototype;g instanceof n||((T.prototype=new n).constructor=T,r.merge(T.prototype,g)),T.$type=T.prototype.$type=this,r.merge(T,n,!0),this._ctor=T;for(var A=0;A<this.fieldsArray.length;++A)this._fieldsArray[A].resolve();var v={};for(A=0;A<this.oneofsArray.length;++A)v[this._oneofsArray[A].resolve().name]={get:r.oneOfGetter(this._oneofsArray[A].oneof),set:r.oneOfSetter(this._oneofsArray[A].oneof)};A&&Object.defineProperties(T.prototype,v)}}}),y.generateConstructor=function(g){for(var A=r.codegen(["p"],g.name),v=0,R;v<g.fieldsArray.length;++v)(R=g._fieldsArray[v]).map?A("this%s={}",r.safeProp(R.name)):R.repeated&&A("this%s=[]",r.safeProp(R.name));return A('if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null&&ks[i]!=="__proto__")')("this[ks[i]]=p[ks[i]]")};function S(T){return T._fieldsById=T._fieldsArray=T._oneofsArray=null,delete T.encode,delete T.decode,delete T.verify,T}return y.fromJSON=function(g,A,v){if(v===void 0&&(v=0),v>r.nestingLimit)throw Error("max depth exceeded");var R=new y(g,A.options);R.extensions=A.extensions,R.reserved=A.reserved;for(var I=Object.keys(A.fields),L=0;L<I.length;++L)R.add((typeof A.fields[I[L]].keyType<"u"?u.fromJSON:c.fromJSON)(I[L],A.fields[I[L]]));if(A.oneofs)for(I=Object.keys(A.oneofs),L=0;L<I.length;++L)R.add(i.fromJSON(I[L],A.oneofs[I[L]]));if(A.nested)for(I=Object.keys(A.nested),L=0;L<I.length;++L){var W=A.nested[I[L]];R.add((W.id!==void 0?c.fromJSON:W.fields!==void 0?y.fromJSON:W.values!==void 0?e.fromJSON:W.methods!==void 0?a.fromJSON:s.fromJSON)(I[L],W,v+1))}return A.extensions&&A.extensions.length&&(R.extensions=A.extensions),A.reserved&&A.reserved.length&&(R.reserved=A.reserved),A.group&&(R.group=!0),A.comment&&(R.comment=A.comment),A.edition&&(R._edition=A.edition),R._defaultEdition="proto3",R},y.prototype.toJSON=function(g){var A=s.prototype.toJSON.call(this,g),v=g?!!g.keepComments:!1;return r.toObject(["edition",this._editionToJSON(),"options",A&&A.options||void 0,"oneofs",s.arrayToJSON(this.oneofsArray,g),"fields",s.arrayToJSON(this.fieldsArray.filter(function(R){return!R.declaringField}),g)||{},"extensions",this.extensions&&this.extensions.length?this.extensions:void 0,"reserved",this.reserved&&this.reserved.length?this.reserved:void 0,"group",this.group||void 0,"nested",A&&A.nested||void 0,"comment",v?this.comment:void 0])},y.prototype.resolveAll=function(){if(!this._needsRecursiveResolve)return this;s.prototype.resolveAll.call(this);var g=this.oneofsArray;for(v=0;v<g.length;)g[v++].resolve();for(var A=this.fieldsArray,v=0;v<A.length;)A[v++].resolve();return this},y.prototype._resolveFeaturesRecursive=function(g){return this._needsRecursiveFeatureResolution?(g=this._edition||g,s.prototype._resolveFeaturesRecursive.call(this,g),this.oneofsArray.forEach(A=>{A._resolveFeatures(g)}),this.fieldsArray.forEach(A=>{A._resolveFeatures(g)}),this):this},y.prototype.get=function(g){return Object.prototype.hasOwnProperty.call(this.fields,g)?this.fields[g]:this.oneofs&&Object.prototype.hasOwnProperty.call(this.oneofs,g)?this.oneofs[g]:this.nested&&Object.prototype.hasOwnProperty.call(this.nested,g)?this.nested[g]:null},y.prototype.add=function(g){if(this.get(g.name))throw Error("duplicate name '"+g.name+"' in "+this);if(g instanceof c&&g.extend===void 0){if(this._fieldsById?this._fieldsById[g.id]:this.fieldsById[g.id])throw Error("duplicate id "+g.id+" in "+this);if(this.isReservedId(g.id))throw Error("id "+g.id+" is reserved in "+this);if(this.isReservedName(g.name)||g.name.charAt(0)==="$")throw Error("name '"+g.name+"' is reserved in "+this);return g.name==="__proto__"?this:(g.parent&&g.parent.remove(g),this.fields[g.name]=g,g.message=this,g.onAdd(this),S(this))}if(g instanceof i){if(g.name.charAt(0)==="$")throw Error("name '"+g.name+"' is reserved in "+this);return g.name==="__proto__"?this:(this.oneofs||(this.oneofs={}),this.oneofs[g.name]=g,g.onAdd(this),S(this))}return s.prototype.add.call(this,g)},y.prototype.remove=function(g){if(g instanceof c&&g.extend===void 0){if(!this.fields||this.fields[g.name]!==g)throw Error(g+" is not a member of "+this);return delete this.fields[g.name],g.parent=null,g.onRemove(this),S(this)}if(g instanceof i){if(!this.oneofs||this.oneofs[g.name]!==g)throw Error(g+" is not a member of "+this);return delete this.oneofs[g.name],g.parent=null,g.onRemove(this),S(this)}return s.prototype.remove.call(this,g)},y.prototype.isReservedId=function(g){return s.isReservedId(this.reserved,g)},y.prototype.isReservedName=function(g){return s.isReservedName(this.reserved,g)},y.prototype.create=function(g){return new this.ctor(g)},y.prototype.setup=function(){for(var g=this.fullName,A=[],v=0;v<this.fieldsArray.length;++v)A.push(this._fieldsArray[v].resolve().resolvedType);this.encode=l(this)({Writer:t,types:A,util:r}),this.decode=f(this)({Reader:o,types:A,util:r}),this.verify=d(this)({types:A,util:r}),this.fromObject=p.fromObject(this)({types:A,util:r}),this.toObject=p.toObject(this)({types:A,util:r});var R=m[g];if(R){var I=Object.create(this);I.fromObject=this.fromObject,this.fromObject=R.fromObject.bind(I),I.toObject=this.toObject,this.toObject=R.toObject.bind(I)}return this},y.prototype.encode=function(g,A){return this.setup().encode.apply(this,arguments)},y.prototype.encodeDelimited=function(g,A){return this.encode(g,A&&A.len?A.fork():A).ldelim()},y.prototype.decode=function(g,A,v,R){return this.setup().decode(g,A,v,R)},y.prototype.decodeDelimited=function(g){return g instanceof o||(g=o.create(g)),this.decode(g,g.uint32())},y.prototype.verify=function(g,A){return this.setup().verify(g,A)},y.prototype.fromObject=function(g,A){return this.setup().fromObject(g,A)},y.prototype.toObject=function(g,A){return this.setup().toObject.apply(this,arguments)},y.d=function(g){return function(v){r.decorateType(v,g)}},Qe}var et,Yt;function Nt(){if(Yt)return et;Yt=1,et=t;var s=Le();((t.prototype=Object.create(s.prototype)).constructor=t).className="Root";var e=Ee(),i=me(),c=Ie(),u=te(),a,n,o;function t(d){s.call(this,"",d),this.deferred=[],this.files=[],this._edition="proto2",this._fullyQualifiedObjects={}}t.fromJSON=function(p,m,y){return y=u.checkDepth(y),m||(m=new t),p.options&&m.setOptions(p.options),m.addJSON(p.nested,y).resolveAll()},t.prototype.resolvePath=u.path.resolve,t.prototype.fetch=u.fetch;function r(){}t.prototype.load=function d(p,m,y){typeof m=="function"&&(y=m,m=void 0);var S=this;if(!y)return u.asPromise(d,S,p,m);var T=y===r;function g(B,q){if(y){if(T)throw B;q&&q.resolveAll();var V=y;y=null,V(B,q)}}function A(B){var q=B.lastIndexOf("google/protobuf/");if(q>-1){var V=B.substring(q);if(V in o)return V}return null}function v(B,q,V){V===void 0&&(V=0);try{if(V>u.recursionLimit)throw Error("max depth exceeded");if(u.isString(q)&&q.charAt(0)==="{"&&(q=JSON.parse(q)),!u.isString(q))S.setOptions(q.options).addJSON(q.nested);else{n.filename=B;var j=n(q,S,m),O,_=0;if(j.imports)for(;_<j.imports.length;++_)(O=A(j.imports[_])||S.resolvePath(B,j.imports[_]))&&R(O,!1,V+1);if(j.weakImports)for(_=0;_<j.weakImports.length;++_)(O=A(j.weakImports[_])||S.resolvePath(B,j.weakImports[_]))&&R(O,!0,V+1)}}catch(h){g(h)}!T&&!I&&g(null,S)}function R(B,q,V){if(V===void 0&&(V=0),B=A(B)||B,!(S.files.indexOf(B)>-1)){if(S.files.push(B),B in o){T?v(B,o[B],V):(++I,setTimeout(function(){--I,v(B,o[B],V)}));return}if(T){var j;try{j=u.fs.readFileSync(B).toString("utf8")}catch(O){q||g(O);return}v(B,j,V)}else++I,S.fetch(B,function(O,_){if(--I,!!y){if(O){q?I||g(null,S):g(O);return}v(B,_,V)}})}}var I=0;u.isString(p)&&(p=[p]);for(var L=0,W;L<p.length;++L)(W=S.resolvePath("",p[L]))&&R(W);return T?(S.resolveAll(),S):(I||g(null,S),S)},t.prototype.loadSync=function(p,m){if(!u.isNode)throw Error("not supported");return this.load(p,m,r)},t.prototype.resolveAll=function(){if(!this._needsRecursiveResolve)return this;if(this.deferred.length)throw Error("unresolvable extensions: "+this.deferred.map(function(p){return"'extend "+p.extend+"' in "+p.parent.fullName}).join(", "));return s.prototype.resolveAll.call(this)};var l=/^[A-Z]/;function f(d,p){var m=p.parent.lookup(p.extend);if(m){var y=new e(p.fullName,p.id,p.type,p.rule,void 0,p.options);return m.get(y.name)||(y.declaringField=p,p.extensionField=y,m.add(y)),!0}return!1}return t.prototype._handleAdd=function(p){if(p instanceof e)p.extend!==void 0&&!p.extensionField&&(f(this,p)||this.deferred.push(p));else if(p instanceof i)l.test(p.name)&&(p.parent[p.name]=p.values);else if(!(p instanceof c)){if(p instanceof a)for(var m=0;m<this.deferred.length;)f(this,this.deferred[m])?this.deferred.splice(m,1):++m;for(var y=0;y<p.nestedArray.length;++y)this._handleAdd(p._nestedArray[y]);l.test(p.name)&&(p.parent[p.name]=p)}(p instanceof a||p instanceof i||p instanceof e)&&(this._fullyQualifiedObjects[p.fullName]=p)},t.prototype._handleRemove=function(p){if(p instanceof e){if(p.extend!==void 0)if(p.extensionField)p.extensionField.parent.remove(p.extensionField),p.extensionField=null;else{var m=this.deferred.indexOf(p);m>-1&&this.deferred.splice(m,1)}}else if(p instanceof i)l.test(p.name)&&delete p.parent[p.name];else if(p instanceof s){for(var y=0;y<p.nestedArray.length;++y)this._handleRemove(p._nestedArray[y]);l.test(p.name)&&delete p.parent[p.name]}delete this._fullyQualifiedObjects[p.fullName]},t._configure=function(d,p,m){a=d,n=p,o=m},et}var Qt;function te(){if(Qt)return Ue.exports;Qt=1;var s=Ue.exports=de(),e=En,i,c;s.codegen=ir,s.fetch=lr,s.path=kn,s.patterns=Nn;var u=s.patterns.reservedRe;s.fs=hr,s.checkDepth=function(t){if(t===void 0&&(t=0),t>s.recursionLimit)throw Error("max depth exceeded");return t},s.toArray=function(t){if(t){for(var r=Object.keys(t),l=new Array(r.length),f=0;f<r.length;)l[f]=t[r[f++]];return l}return[]},s.toObject=function(t){for(var r={},l=0;l<t.length;){var f=t[l++],d=t[l++];d!==void 0&&(r[f]=d)}return r},s.isReserved=function(t){return u.test(t)},s.safeProp=function(t){return!/^[$\w_]+$/.test(t)||u.test(t)?"["+JSON.stringify(t)+"]":"."+t},s.ucFirst=function(t){return t.charAt(0).toUpperCase()+t.substring(1)};var a=/_([a-z])/g;s.camelCase=function(t){return t.substring(0,1)+t.substring(1).replace(a,function(r,l){return l.toUpperCase()})},s.compareFieldsById=function(t,r){return t.id-r.id},s.decorateType=function(t,r){if(t.$type)return r&&t.$type.name!==r&&(s.decorateRoot.remove(t.$type),t.$type.name=r,s.decorateRoot.add(t.$type)),t.$type;i||(i=kt());var l=new i(r||t.name);return s.decorateRoot.add(l),l.ctor=t,Object.defineProperty(t,"$type",{value:l,enumerable:!1}),Object.defineProperty(t.prototype,"$type",{value:l,enumerable:!1}),l};var n=0;return s.decorateEnum=function(t){if(t.$type)return t.$type;c||(c=me());var r=new c("Enum"+n++,t);return s.decorateRoot.add(r),Object.defineProperty(t,"$type",{value:r,enumerable:!1}),r},s.setProperty=function(t,r,l,f){function d(p,m,y){var S=m.shift();if(s.isUnsafeProperty(S))return p;if(m.length>0)p[S]=d(p[S]||{},m,y);else{var T=p[S];if(T&&f)return p;T&&(y=[].concat(T).concat(y)),p[S]=y}return p}if(typeof t!="object")throw TypeError("dst must be an object");if(!r)throw TypeError("path must be specified");if(r=r.split("."),r.length>s.recursionLimit)throw Error("max depth exceeded");return d(t,r,l)},Object.defineProperty(s,"decorateRoot",{get:function(){return e.decorated||(e.decorated=new(Nt()))}}),Ue.exports}var en;function Re(){return en||(en=1,function(s){var e=s,i=te(),c=["double","float","int32","uint32","sint32","fixed32","sfixed32","int64","uint64","sint64","fixed64","sfixed64","bool","string","bytes"];function u(a,n){var o=0,t=Object.create(null);for(n|=0;o<a.length;)t[c[o+n]]=a[o++];return t}e.basic=u([1,5,0,0,0,5,5,0,0,0,1,1,0,2,2]),e.defaults=u([0,0,0,0,0,0,0,0,0,0,0,0,!1,"",i.emptyArray,null]),e.long=u([0,0,0,1,1],7),e.mapKey=u([0,0,0,5,5,0,0,0,1,1,0,2],2),e.packed=u([1,5,0,0,0,5,5,0,0,0,1,1,0])}($e)),$e}var tt,tn;function Ee(){if(tn)return tt;tn=1,tt=n;var s=Ae();((n.prototype=Object.create(s.prototype)).constructor=n).className="Field";var e=me(),i=Re(),c=te(),u,a=/^required|optional|repeated$/;n.fromJSON=function(t,r){var l=new n(t,r.id,r.type,r.rule,r.extend,r.options,r.comment);return r.edition&&(l._edition=r.edition),l._defaultEdition="proto3",l};function n(o,t,r,l,f,d,p){if(c.isObject(l)?(p=f,d=l,l=f=void 0):c.isObject(f)&&(p=d,d=f,f=void 0),s.call(this,o,d),!c.isInteger(t)||t<0)throw TypeError("id must be a non-negative integer");if(!c.isString(r))throw TypeError("type must be a string");if(l!==void 0&&!a.test(l=l.toString().toLowerCase()))throw TypeError("rule must be a string rule");if(f!==void 0&&!c.isString(f))throw TypeError("extend must be a string");l==="proto3_optional"&&(l="optional"),this.rule=l&&l!=="optional"?l:void 0,this.type=r,this.id=t,this.extend=f||void 0,this.repeated=l==="repeated",this.map=!1,this.message=null,this.partOf=null,this.typeDefault=null,this.defaultValue=null,this.long=c.Long?i.long[r]!==void 0:!1,this.bytes=r==="bytes",this.resolvedType=null,this.extensionField=null,this.declaringField=null,this.comment=p}return Object.defineProperty(n.prototype,"required",{get:function(){return this._features.field_presence==="LEGACY_REQUIRED"}}),Object.defineProperty(n.prototype,"optional",{get:function(){return!this.required}}),Object.defineProperty(n.prototype,"delimited",{get:function(){return this.resolvedType instanceof u&&this._features.message_encoding==="DELIMITED"}}),Object.defineProperty(n.prototype,"packed",{get:function(){return this._features.repeated_field_encoding==="PACKED"}}),Object.defineProperty(n.prototype,"hasPresence",{get:function(){return this.repeated||this.map?!1:this.partOf||this.declaringField||this.extensionField||this._features.field_presence!=="IMPLICIT"}}),n.prototype.setOption=function(t,r,l){return s.prototype.setOption.call(this,t,r,l)},n.prototype.toJSON=function(t){var r=t?!!t.keepComments:!1;return c.toObject(["edition",this._editionToJSON(),"rule",this.rule!=="optional"&&this.rule||void 0,"type",this.type,"id",this.id,"extend",this.extend,"options",this.options,"comment",r?this.comment:void 0])},n.prototype.resolve=function(){if(this.resolved)return this;if((this.typeDefault=i.defaults[this.type])===void 0?(this.resolvedType=(this.declaringField?this.declaringField.parent:this.parent).lookupTypeOrEnum(this.type),this.resolvedType instanceof u?this.typeDefault=null:this.typeDefault=this.resolvedType.values[Object.keys(this.resolvedType.values)[0]]):this.options&&this.options.proto3_optional&&(this.typeDefault=null),this.options&&this.options.default!=null&&(this.typeDefault=this.options.default,this.resolvedType instanceof e&&typeof this.typeDefault=="string"&&(this.typeDefault=this.resolvedType.values[this.typeDefault])),this.options&&(this.options.packed!==void 0&&this.resolvedType&&!(this.resolvedType instanceof e)&&delete this.options.packed,Object.keys(this.options).length||(this.options=void 0)),this.long)this.typeDefault=c.Long.fromNumber(this.typeDefault,this.type==="uint64"||this.type==="fixed64"),Object.freeze&&Object.freeze(this.typeDefault);else if(this.bytes&&typeof this.typeDefault=="string"){var t;c.base64.test(this.typeDefault)?c.base64.decode(this.typeDefault,t=c.newBuffer(c.base64.length(this.typeDefault)),0):c.utf8.write(this.typeDefault,t=c.newBuffer(c.utf8.length(this.typeDefault)),0),this.typeDefault=t}return this.map?this.defaultValue=c.emptyObject:this.repeated?this.defaultValue=c.emptyArray:this.defaultValue=this.typeDefault,this.parent instanceof u&&(this.parent.ctor.prototype[this.name]=this.defaultValue),s.prototype.resolve.call(this)},n.prototype._inferLegacyProtoFeatures=function(t){if(t!=="proto2"&&t!=="proto3")return{};var r={};if(this.rule==="required"&&(r.field_presence="LEGACY_REQUIRED"),this.parent&&i.defaults[this.type]===void 0){var l=this.parent.get(this.type.split(".").pop());l&&l instanceof u&&l.group&&(r.message_encoding="DELIMITED")}return this.getOption("packed")===!0?r.repeated_field_encoding="PACKED":this.getOption("packed")===!1&&(r.repeated_field_encoding="EXPANDED"),r},n.prototype._resolveFeatures=function(t){return s.prototype._resolveFeatures.call(this,this._edition||t)},n.d=function(t,r,l,f){return typeof r=="function"?r=c.decorateType(r).name:r&&typeof r=="object"&&(r=c.decorateEnum(r).name),function(p,m){c.decorateType(p.constructor).add(new n(m,t,r,l,{default:f}))}},n._configure=function(t){u=t},tt}var nt,nn;function Ie(){if(nn)return nt;nn=1,nt=c;var s=Ae();((c.prototype=Object.create(s.prototype)).constructor=c).className="OneOf";var e=Ee(),i=te();function c(a,n,o,t){if(Array.isArray(n)||(o=n,n=void 0),s.call(this,a,o),!(n===void 0||Array.isArray(n)))throw TypeError("fieldNames must be an Array");this.oneof=n||[],this.fieldsArray=[],this.comment=t}c.fromJSON=function(n,o){return new c(n,o.oneof,o.options,o.comment)},c.prototype.toJSON=function(n){var o=n?!!n.keepComments:!1;return i.toObject(["options",this.options,"oneof",this.oneof,"comment",o?this.comment:void 0])};function u(a){if(a.parent)for(var n=0;n<a.fieldsArray.length;++n)a.fieldsArray[n].parent||a.parent.add(a.fieldsArray[n])}return c.prototype.add=function(n){if(!(n instanceof e))throw TypeError("field must be a Field");return n.parent&&n.parent!==this.parent&&n.parent.remove(n),this.oneof.push(n.name),this.fieldsArray.push(n),n.partOf=this,u(this),this},c.prototype.remove=function(n){if(!(n instanceof e))throw TypeError("field must be a Field");var o=this.fieldsArray.indexOf(n);if(o<0)throw Error(n+" is not a member of "+this);return this.fieldsArray.splice(o,1),o=this.oneof.indexOf(n.name),o>-1&&this.oneof.splice(o,1),n.partOf=null,this},c.prototype.onAdd=function(n){s.prototype.onAdd.call(this,n);for(var o=this,t=0;t<this.oneof.length;++t){var r=n.get(this.oneof[t]);r&&!r.partOf&&(r.partOf=o,o.fieldsArray.push(r))}u(this)},c.prototype.onRemove=function(n){for(var o=0,t;o<this.fieldsArray.length;++o)(t=this.fieldsArray[o]).parent&&t.parent.remove(t);s.prototype.onRemove.call(this,n)},Object.defineProperty(c.prototype,"isProto3Optional",{get:function(){if(this.fieldsArray==null||this.fieldsArray.length!==1)return!1;var a=this.fieldsArray[0];return a.options!=null&&a.options.proto3_optional===!0}}),c.d=function(){for(var n=new Array(arguments.length),o=0;o<arguments.length;)n[o]=arguments[o++];return function(r,l){i.decorateType(r.constructor).add(new c(l,n)),Object.defineProperty(r,l,{get:i.oneOfGetter(n),set:i.oneOfSetter(n)})}},nt}var rt,rn;function Ae(){if(rn)return rt;rn=1,rt=n,n.className="ReflectionObject";const s=Ie();var e=te(),i,c={enum_type:"OPEN",field_presence:"EXPLICIT",json_format:"ALLOW",message_encoding:"LENGTH_PREFIXED",repeated_field_encoding:"PACKED",utf8_validation:"VERIFY"},u={enum_type:"CLOSED",field_presence:"EXPLICIT",json_format:"LEGACY_BEST_EFFORT",message_encoding:"LENGTH_PREFIXED",repeated_field_encoding:"EXPANDED",utf8_validation:"NONE"},a={enum_type:"OPEN",field_presence:"IMPLICIT",json_format:"ALLOW",message_encoding:"LENGTH_PREFIXED",repeated_field_encoding:"PACKED",utf8_validation:"VERIFY"};function n(o,t){if(!e.isString(o))throw TypeError("name must be a string");if(t&&!e.isObject(t))throw TypeError("options must be an object");this.options=t,this.parsedOptions=null,this.name=o,this._edition=null,this._defaultEdition="proto2",this._features={},this._featuresResolved=!1,this.parent=null,this.resolved=!1,this.comment=null,this.filename=null}return Object.defineProperties(n.prototype,{root:{get:function(){for(var o=this;o.parent!==null;)o=o.parent;return o}},fullName:{get:function(){for(var o=[this.name],t=this.parent;t;)o.unshift(t.name),t=t.parent;return o.join(".")}}}),n.prototype.toJSON=function(){throw Error()},n.prototype.onAdd=function(t){this.parent&&this.parent!==t&&this.parent.remove(this),this.parent=t,this.resolved=!1;var r=t.root;r instanceof i&&r._handleAdd(this)},n.prototype.onRemove=function(t){var r=t.root;r instanceof i&&r._handleRemove(this),this.parent=null,this.resolved=!1},n.prototype.resolve=function(){return this.resolved?this:(this.root instanceof i&&(this.resolved=!0),this)},n.prototype._resolveFeaturesRecursive=function(t){return this._resolveFeatures(this._edition||t)},n.prototype._resolveFeatures=function(t){if(!this._featuresResolved){var r={};if(!t)throw new Error("Unknown edition for "+this.fullName);var l=e.merge({},this.options&&this.options.features,this._inferLegacyProtoFeatures(t));if(this._edition){if(t==="proto2")r=Object.assign({},u);else if(t==="proto3")r=Object.assign({},a);else if(t==="2023")r=Object.assign({},c);else throw new Error("Unknown edition: "+t);this._features=e.merge(r,l),this._featuresResolved=!0;return}if(this.partOf instanceof s){var f=e.merge({},this.partOf._features);this._features=e.merge(f,l)}else if(!this.declaringField)if(this.parent){var d=e.merge({},this.parent._features);this._features=e.merge(d,l)}else throw new Error("Unable to find a parent for "+this.fullName);this.extensionField&&(this.extensionField._features=this._features),this._featuresResolved=!0}},n.prototype._inferLegacyProtoFeatures=function(){return{}},n.prototype.getOption=function(t){if(this.options)return this.options[t]},n.prototype.setOption=function(t,r,l){return t==="__proto__"?this:(this.options||(this.options={}),/^features\./.test(t)?e.setProperty(this.options,t,r,l):(!l||this.options[t]===void 0)&&(this.getOption(t)!==r&&(this.resolved=!1),this.options[t]=r),this)},n.prototype.setParsedOption=function(t,r,l){if(t==="__proto__")return this;this.parsedOptions||(this.parsedOptions=[]);var f=this.parsedOptions;if(l){var d=f.find(function(y){return Object.prototype.hasOwnProperty.call(y,t)});if(d){var p=d[t];e.setProperty(p,l,r)}else d={},d[t]=e.setProperty({},l,r),f.push(d)}else{var m={};m[t]=r,f.push(m)}return this},n.prototype.setOptions=function(t,r){if(t)for(var l=Object.keys(t),f=0;f<l.length;++f)this.setOption(l[f],t[l[f]],r);return this},n.prototype.toString=function(){var t=this.constructor.className,r=this.fullName;return r.length?t+" "+r:t},n.prototype._editionToJSON=function(){if(!(!this._edition||this._edition==="proto3"))return this._edition},n._configure=function(o){i=o},rt}var it,sn;function me(){if(sn)return it;sn=1,it=c;var s=Ae();((c.prototype=Object.create(s.prototype)).constructor=c).className="Enum";var e=Le(),i=te();function c(u,a,n,o,t,r){if(s.call(this,u,n),a&&typeof a!="object")throw TypeError("values must be an object");if(this.valuesById={},this.values=Object.create(this.valuesById),this.comment=o,this.comments=t||{},this.valuesOptions=r,this._valuesFeatures={},this.reserved=void 0,a)for(var l=Object.keys(a),f=0;f<l.length;++f)l[f]!=="__proto__"&&typeof a[l[f]]=="number"&&(this.valuesById[this.values[l[f]]=a[l[f]]]=l[f])}return c.prototype._resolveFeatures=function(a){return a=this._edition||a,s.prototype._resolveFeatures.call(this,a),Object.keys(this.values).forEach(n=>{var o=i.merge({},this._features);this._valuesFeatures[n]=i.merge(o,this.valuesOptions&&this.valuesOptions[n]&&this.valuesOptions[n].features||{})}),this},c.fromJSON=function(a,n){var o=new c(a,n.values,n.options,n.comment,n.comments);return o.reserved=n.reserved,n.edition&&(o._edition=n.edition),o._defaultEdition="proto3",o},c.prototype.toJSON=function(a){var n=a?!!a.keepComments:!1;return i.toObject(["edition",this._editionToJSON(),"options",this.options,"valuesOptions",this.valuesOptions,"values",this.values,"reserved",this.reserved&&this.reserved.length?this.reserved:void 0,"comment",n?this.comment:void 0,"comments",n?this.comments:void 0])},c.prototype.add=function(a,n,o,t){if(!i.isString(a))throw TypeError("name must be a string");if(!i.isInteger(n))throw TypeError("id must be an integer");if(a==="__proto__")return this;if(this.values[a]!==void 0)throw Error("duplicate name '"+a+"' in "+this);if(this.isReservedId(n))throw Error("id "+n+" is reserved in "+this);if(this.isReservedName(a))throw Error("name '"+a+"' is reserved in "+this);if(this.valuesById[n]!==void 0){if(!(this.options&&this.options.allow_alias))throw Error("duplicate id "+n+" in "+this);this.values[a]=n}else this.valuesById[this.values[a]=n]=a;return t&&(this.valuesOptions===void 0&&(this.valuesOptions={}),this.valuesOptions[a]=t||null),this.comments[a]=o||null,this},c.prototype.remove=function(a){if(!i.isString(a))throw TypeError("name must be a string");var n=this.values[a];if(n==null)throw Error("name '"+a+"' does not exist in "+this);return delete this.valuesById[n],delete this.values[a],delete this.comments[a],this.valuesOptions&&delete this.valuesOptions[a],this},c.prototype.isReservedId=function(a){return e.isReservedId(this.reserved,a)},c.prototype.isReservedName=function(a){return e.isReservedName(this.reserved,a)},it}var st,on;function Sn(){if(on)return st;on=1,st=u;var s=me(),e=Re(),i=te();function c(a,n,o,t){return n.delimited?a("types[%i].encode(%s,w.uint32(%i),q+1).uint32(%i)",o,t,(n.id<<3|3)>>>0,(n.id<<3|4)>>>0):a("types[%i].encode(%s,w.uint32(%i).fork(),q+1).ldelim()",o,t,(n.id<<3|2)>>>0)}function u(a){for(var n=i.codegen(["m","w","q"],a.name+"$encode")("if(!w)")("w=Writer.create()")("if(q===undefined)q=0")("if(q>util.recursionLimit)")('throw Error("max depth exceeded")'),o,t,r=a.fieldsArray.slice().sort(i.compareFieldsById),o=0;o<r.length;++o){var l=r[o].resolve(),f=a._fieldsArray.indexOf(l),d=l.resolvedType instanceof s?"int32":l.type,p=e.basic[d];t="m"+i.safeProp(l.name),l.map?(n("if(%s!=null&&Object.hasOwnProperty.call(m,%j)){",t,l.name)("for(var ks=Object.keys(%s),i=0;i<ks.length;++i){",t)("w.uint32(%i).fork().uint32(%i).%s(ks[i])",(l.id<<3|2)>>>0,8|e.mapKey[l.keyType],l.keyType),p===void 0?n("types[%i].encode(%s[ks[i]],w.uint32(18).fork(),q+1).ldelim().ldelim()",f,t):n(".uint32(%i).%s(%s[ks[i]]).ldelim()",16|p,d,t),n("}")("}")):l.repeated?(n("if(%s!=null&&%s.length){",t,t),l.packed&&e.packed[d]!==void 0?n("w.uint32(%i).fork()",(l.id<<3|2)>>>0)("for(var i=0;i<%s.length;++i)",t)("w.%s(%s[i])",d,t)("w.ldelim()"):(n("for(var i=0;i<%s.length;++i)",t),p===void 0?c(n,l,f,t+"[i]"):n("w.uint32(%i).%s(%s[i])",(l.id<<3|p)>>>0,d,t)),n("}")):(l.optional&&n("if(%s!=null&&Object.hasOwnProperty.call(m,%j))",t,l.name),p===void 0?c(n,l,f,t):n("w.uint32(%i).%s(%s)",(l.id<<3|p)>>>0,d,t))}return n("return w")}return st}var M=pn.exports=mn;M.build="light";function pr(s,e,i){return typeof e=="function"?(i=e,e=new M.Root):e||(e=new M.Root),e.load(s,i)}M.load=pr;function mr(s,e){return e||(e=new M.Root),e.loadSync(s)}M.loadSync=mr;M.encoder=Sn();M.decoder=Tn();M.verifier=Rn();M.converter=In();M.ReflectionObject=Ae();M.Namespace=Le();M.Root=Nt();M.Enum=me();M.Type=kt();M.Field=Ee();M.OneOf=Ie();M.MapField=wt();M.Service=xt();M.Method=Ot();M.Message=Et;M.wrappers=At;M.types=Re();M.util=te();M.ReflectionObject._configure(M.Root);M.Namespace._configure(M.Type,M.Service,M.Enum);M.Root._configure(M.Type);M.Field._configure(M.Type);var yr=pn.exports,Cn=Ln,ot=/[\s{}=;:[\],'"()<>]/g,gr=/(?:"([^"\\]*(?:\\.[^"\\]*)*)")/g,vr=/(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g,_r=/^ *[*/]+ */,br=/^\s*\*?\/*/,wr=/\n/g,Or=/\s/,xr=/\\(.?)/g,Er={0:"\0",r:"\r",n:`
`,t:"	"};function Fn(s){return s.replace(xr,function(e,i){switch(i){case"\\":case"":return i;default:return Er[i]||""}})}Ln.unescape=Fn;function Ln(s,e){s=s.toString();var i=0,c=s.length,u=1,a=0,n={},o=[],t=null;function r(v){return Error("illegal "+v+" (line "+u+")")}function l(){var v=t==="'"?vr:gr;v.lastIndex=i-1;var R=v.exec(s);if(!R)throw r("string");return i=v.lastIndex,S(t),t=null,Fn(R[1])}function f(v){return s.charAt(v)}function d(v,R,I){var L={type:s.charAt(v++),lineEmpty:!1,leading:I},W;e?W=2:W=3;var B=v-W,q;do if(--B<0||(q=s.charAt(B))===`
`){L.lineEmpty=!0;break}while(q===" "||q==="	");for(var V=s.substring(v,R).split(wr),j=0;j<V.length;++j)V[j]=V[j].replace(e?br:_r,"").trim();L.text=V.join(`
`).trim(),n[u]=L,a=u}function p(v){var R=m(v),I=s.substring(v,R),L=/^\s*\/\//.test(I);return L}function m(v){for(var R=v;R<c&&f(R)!==`
`;)R++;return R}function y(){if(o.length>0)return o.shift();if(t)return l();var v,R,I,L,W,B=i===0;do{if(i===c)return null;for(v=!1;Or.test(I=f(i));)if(I===`
`&&(B=!0,++u),++i===c)return null;if(f(i)==="/"){if(++i===c)throw r("comment");if(f(i)==="/")if(e){if(L=i,W=!1,p(i-1)){W=!0;do if(i=m(i),i===c||(i++,!B))break;while(p(i))}else i=Math.min(c,m(i)+1);W&&(d(L,i,B),B=!0),u++,v=!0}else{for(W=f(L=i+1)==="/";f(++i)!==`
`;)if(i===c)return null;++i,W&&(d(L,i-1,B),B=!0),++u,v=!0}else if((I=f(i))==="*"){L=i+1,W=e||f(L)==="*";do{if(I===`
`&&++u,++i===c)throw r("comment");R=I,I=f(i)}while(R!=="*"||I!=="/");++i,W&&(d(L,i-2,B),B=!0),v=!0}else return"/"}}while(v);var q=i;ot.lastIndex=0;var V=ot.test(f(q++));if(!V)for(;q<c&&!ot.test(f(q));)++q;var j=s.substring(i,i=q);return(j==='"'||j==="'")&&(t=j),j}function S(v){o.push(v)}function T(){if(!o.length){var v=y();if(v===null)return null;S(v)}return o[0]}function g(v,R){var I=T(),L=I===v;if(L)return y(),!0;if(!R)throw r("token '"+I+"', '"+v+"' expected");return!1}function A(v){var R=null,I;return v===void 0?(I=n[u-1],delete n[u-1],I&&(e||I.type==="*"||I.lineEmpty)&&(R=I.leading?I.text:null)):(a<v&&T(),I=n[v],delete n[v],I&&!I.lineEmpty&&(e||I.type==="/")&&(R=I.leading?null:I.text)),R}return Object.defineProperty({next:y,peek:T,push:S,skip:g,cmnt:A},"line",{get:function(){return u}})}var Ar=ge;ge.filename=null;ge.defaults={keepCase:!1};var kr=Cn,an=Nt(),un=kt(),fn=Ee(),Nr=wt(),ln=Ie(),Tr=me(),Rr=xt(),Ir=Ot(),Sr=Ae(),Cr=Re(),ye=te(),Fr=/^[1-9][0-9]*$/,Lr=/^-?[1-9][0-9]*$/,Br=/^0[x][0-9a-fA-F]+$/,Pr=/^-?0[x][0-9a-fA-F]+$/,Dr=/^0[0-7]+$/,jr=/^-?0[0-7]+$/,Mr=ye.patterns.numberRe,le=/^[a-zA-Z_][a-zA-Z_0-9]*$/,ce=ye.patterns.typeRefRe;function ge(s,e,i){e instanceof an||(i=e,e=new an),i||(i=ge.defaults);var c=i.preferTrailingComment||!1,u=kr(s,i.alternateCommentMode||!1),a=u.next,n=u.push,o=u.peek,t=u.skip,r=u.cmnt,l=!0,f,d,p,m="proto2",y=e,S=[],T={},g=i.keepCase?function(w){return w}:ye.camelCase;function A(){S.forEach(w=>{w._edition=m,Object.keys(T).forEach(b=>{w.getOption(b)===void 0&&w.setOption(b,T[b],!0)})})}function v(w,b,E){var k=ge.filename;return E||(ge.filename=null),Error("illegal "+(b||"token")+" '"+w+"' ("+(k?k+", ":"")+"line "+u.line+")")}function R(){var w=[],b;do{if((b=a())!=='"'&&b!=="'")throw v(b);w.push(a()),t(b),b=o()}while(b==='"'||b==="'");return w.join("")}function I(w){var b=a();switch(b){case"'":case'"':return n(b),R();case"true":case"TRUE":return!0;case"false":case"FALSE":return!1}try{return W(b,!0)}catch{if(ce.test(b))return b;throw v(b,"value")}}function L(w,b){var E,k;do if(b&&((E=o())==='"'||E==="'")){var F=R();if(w.push(F),m>=2023)throw v(F,"id")}else try{w.push([k=B(a()),t("to",!0)?B(a()):k])}catch(D){if(b&&ce.test(E)&&m>=2023)w.push(E);else throw D}while(t(",",!0));var C={options:void 0};C.setOption=function(D,X){this.options===void 0&&(this.options={}),this.options[D]=X},h(C,function(X){if(X==="option")$(C,X),t(";");else throw v(X)},function(){Y(C)})}function W(w,b){var E=1;switch(w.charAt(0)==="-"&&(E=-1,w=w.substring(1)),w){case"inf":case"INF":case"Inf":return E*(1/0);case"nan":case"NAN":case"Nan":case"NaN":return NaN;case"0":return 0}if(Fr.test(w))return E*parseInt(w,10);if(Br.test(w))return E*parseInt(w,16);if(Dr.test(w))return E*parseInt(w,8);if(Mr.test(w))return E*parseFloat(w);throw v(w,"number",b)}function B(w,b){switch(w){case"max":case"MAX":case"Max":return 536870911;case"0":return 0}if(!b&&w.charAt(0)==="-")throw v(w,"id");if(Lr.test(w))return parseInt(w,10);if(Pr.test(w))return parseInt(w,16);if(jr.test(w))return parseInt(w,8);throw v(w,"id")}function q(){if(f!==void 0)throw v("package");if(f=a(),!ce.test(f))throw v(f,"name");y=y.define(f),t(";")}function V(){var w=o(),b;switch(w){case"weak":b=p||(p=[]),a();break;case"public":a();default:b=d||(d=[]);break}w=R(),t(";"),b.push(w)}function j(){if(t("="),m=R(),m<2023)throw v(m,"syntax");t(";")}function O(){if(t("="),m=R(),!["2023"].includes(m))throw v(m,"edition");t(";")}function _(w,b,E){switch(E===void 0&&(E=0),b){case"option":return $(w,b),t(";"),!0;case"message":return N(w,b,E+1),!0;case"enum":return Q(w,b),!0;case"service":return ke(w,b,E+1),!0;case"extend":return qn(w,b,E),!0}return!1}function h(w,b,E){var k=u.line;if(w&&(typeof w.comment!="string"&&(w.comment=r()),w.filename=ge.filename),t("{",!0)){for(var F;(F=a())!=="}";)b(F);t(";",!0)}else E&&E(),t(";"),w&&(typeof w.comment!="string"||c)&&(w.comment=r(k)||w.comment)}function N(w,b,E){if(E===void 0&&(E=0),E>ye.nestingLimit)throw Error("max depth exceeded");if(!le.test(b=a()))throw v(b,"type name");var k=new un(b);h(k,function(C){if(!_(k,C,E))switch(C){case"map":U(k);break;case"required":if(m!=="proto2")throw v(C);case"repeated":P(k,C,void 0,E+1);break;case"optional":if(m==="proto3")P(k,"proto3_optional",void 0,E+1);else{if(m!=="proto2")throw v(C);P(k,"optional",void 0,E+1)}break;case"oneof":G(k,C,E+1);break;case"extensions":L(k.extensions||(k.extensions=[]));break;case"reserved":L(k.reserved||(k.reserved=[]),!0);break;default:if(m==="proto2"||!ce.test(C))throw v(C);n(C),P(k,"optional",void 0,E+1);break}}),w.add(k),w===y&&S.push(k)}function P(w,b,E,k){var F=a();if(F==="group"){J(w,b,k);return}for(;F.endsWith(".")||o().startsWith(".");)F+=a();if(!ce.test(F))throw v(F,"type");var C=a();if(!le.test(C))throw v(C,"name");C=g(C),t("=");var D=new fn(C,B(a()),F,b,E);if(h(D,function(re){if(re==="option")$(D,re),t(";");else throw v(re)},function(){Y(D)}),b==="proto3_optional"){var X=new ln("_"+C);D.setOption("proto3_optional",!0),X.add(D),w.add(X)}else w.add(D);w===y&&S.push(D)}function J(w,b,E){if(E===void 0&&(E=0),E>ye.nestingLimit)throw Error("max depth exceeded");if(m>=2023)throw v("group");var k=a();if(!le.test(k))throw v(k,"name");var F=ye.lcFirst(k);k===F&&(k=ye.ucFirst(k)),t("=");var C=B(a()),D=new un(k);D.group=!0;var X=new fn(F,C,k,b);X.filename=ge.filename,h(D,function(re){switch(re){case"option":$(D,re),t(";");break;case"required":case"repeated":P(D,re,void 0,E+1);break;case"optional":m==="proto3"?P(D,"proto3_optional",void 0,E+1):P(D,"optional",void 0,E+1);break;case"message":N(D,re,E+1);break;case"enum":Q(D,re);break;case"reserved":L(D.reserved||(D.reserved=[]),!0);break;default:throw v(re)}}),w.add(D).add(X)}function U(w){t("<");var b=a();if(Cr.mapKey[b]===void 0)throw v(b,"type");t(",");var E=a();if(!ce.test(E))throw v(E,"type");t(">");var k=a();if(!le.test(k))throw v(k,"name");t("=");var F=new Nr(g(k),B(a()),b,E);h(F,function(D){if(D==="option")$(F,D),t(";");else throw v(D)},function(){Y(F)}),w.add(F)}function G(w,b,E){if(!le.test(b=a()))throw v(b,"name");var k=new ln(g(b));h(k,function(C){C==="option"?($(k,C),t(";")):(n(C),P(k,"optional",void 0,E))}),w.add(k)}function Q(w,b){if(!le.test(b=a()))throw v(b,"name");var E=new Tr(b);h(E,function(F){switch(F){case"option":$(E,F),t(";");break;case"reserved":L(E.reserved||(E.reserved=[]),!0),E.reserved===void 0&&(E.reserved=[]);break;default:ie(E,F)}}),w.add(E),w===y&&S.push(E)}function ie(w,b){if(!le.test(b))throw v(b,"name");t("=");var E=B(a(),!0),k={options:void 0};k.getOption=function(F){return this.options[F]},k.setOption=function(F,C){Sr.prototype.setOption.call(k,F,C)},k.setParsedOption=function(){},h(k,function(C){if(C==="option")$(k,C),t(";");else throw v(C)},function(){Y(k)}),w.add(b,E,k.comment,k.parsedOptions||k.options)}function $(w,b){var E,k,F=!0;for(b==="option"&&(b=a());b!=="=";){if(b==="("){var C=a();t(")"),b="("+C+")"}if(F){if(F=!1,b.includes(".")&&!b.includes("(")){var D=b.split(".");E=D[0]+".",b=D[1];continue}E=b}else k=k?k+=b:b;b=a()}var X=k?E.concat(k):E,fe=H(w,X);k=k&&k[0]==="."?k.slice(1):k,E=E&&E[E.length-1]==="."?E.slice(0,-1):E,K(w,E,fe,k)}function H(w,b,E){if(E===void 0&&(E=0),E>ye.recursionLimit)throw Error("max depth exceeded");if(t("{",!0)){for(var k={};!t("}",!0);){if(!le.test(ee=a()))throw v(ee,"name");if(ee===null)throw v(ee,"end of input");var F,C=ee;if(t(":",!0),o()==="{")F=H(w,b+"."+ee,E+1);else if(o()==="["){F=[];var D;if(t("[",!0)){do D=I(),F.push(D);while(t(",",!0));t("]"),typeof D<"u"&&ne(w,b+"."+ee,D)}}else F=I(),ne(w,b+"."+ee,F);var X=k[C];X&&(F=[].concat(X).concat(F)),C!=="__proto__"&&(k[C]=F),t(",",!0),t(";",!0)}return k}var fe=I();return ne(w,b,fe),fe}function ne(w,b,E){if(y===w&&/^features\./.test(b)){T[b]=E;return}w.setOption&&w.setOption(b,E)}function K(w,b,E,k){w.setParsedOption&&w.setParsedOption(b,E,k)}function Y(w){if(t("[",!0)){do $(w,"option");while(t(",",!0));t("]")}return w}function ke(w,b,E){if(E===void 0&&(E=0),E>ye.recursionLimit)throw Error("max depth exceeded");if(!le.test(b=a()))throw v(b,"service name");var k=new Rr(b);h(k,function(C){if(!_(k,C,E))if(C==="rpc")Mn(k,C);else throw v(C)}),w.add(k),w===y&&S.push(k)}function Mn(w,b){var E=r(),k=b;if(!le.test(b=a()))throw v(b,"name");var F=b,C,D,X,fe;if(t("("),t("stream",!0)&&(D=!0),!ce.test(b=a())||(C=b,t(")"),t("returns"),t("("),t("stream",!0)&&(fe=!0),!ce.test(b=a())))throw v(b);X=b,t(")");var re=new Ir(F,k,C,X,D,fe);re.comment=E,h(re,function(Me){if(Me==="option")$(re,Me),t(";");else throw v(Me)}),w.add(re)}function qn(w,b,E){if(!ce.test(b=a()))throw v(b,"reference");var k=b;h(null,function(C){switch(C){case"required":case"repeated":P(w,C,k,E+1);break;case"optional":m==="proto3"?P(w,"proto3_optional",k,E+1):P(w,"optional",k,E+1);break;default:if(m==="proto2"||!ce.test(C))throw v(C);n(C),P(w,"optional",k,E+1);break}})}for(var ee;(ee=a())!==null;)switch(ee){case"package":if(!l)throw v(ee);q();break;case"import":if(!l)throw v(ee);V();break;case"syntax":if(!l)throw v(ee);j();break;case"edition":if(!l)throw v(ee);O();break;case"option":$(y,ee),t(";",!0);break;default:if(_(y,ee,0)){l=!1;continue}throw v(ee)}return A(),ge.filename=null,{package:f,imports:d,weakImports:p,root:e}}var qr=ue,zr=/\/|\./;function ue(s,e){zr.test(s)||(s="google/protobuf/"+s+".proto",e={nested:{google:{nested:{protobuf:{nested:e}}}}}),ue[s]=e}ue("any",{Any:{fields:{type_url:{type:"string",id:1},value:{type:"bytes",id:2}}}});var Bn;ue("duration",{Duration:Bn={fields:{seconds:{type:"int64",id:1},nanos:{type:"int32",id:2}}}});ue("timestamp",{Timestamp:Bn});ue("empty",{Empty:{fields:{}}});ue("struct",{Struct:{fields:{fields:{keyType:"string",type:"Value",id:1}}},Value:{oneofs:{kind:{oneof:["nullValue","numberValue","stringValue","boolValue","structValue","listValue"]}},fields:{nullValue:{type:"NullValue",id:1},numberValue:{type:"double",id:2},stringValue:{type:"string",id:3},boolValue:{type:"bool",id:4},structValue:{type:"Struct",id:5},listValue:{type:"ListValue",id:6}}},NullValue:{values:{NULL_VALUE:0}},ListValue:{fields:{values:{rule:"repeated",type:"Value",id:1}}}});ue("wrappers",{DoubleValue:{fields:{value:{type:"double",id:1}}},FloatValue:{fields:{value:{type:"float",id:1}}},Int64Value:{fields:{value:{type:"int64",id:1}}},UInt64Value:{fields:{value:{type:"uint64",id:1}}},Int32Value:{fields:{value:{type:"int32",id:1}}},UInt32Value:{fields:{value:{type:"uint32",id:1}}},BoolValue:{fields:{value:{type:"bool",id:1}}},StringValue:{fields:{value:{type:"string",id:1}}},BytesValue:{fields:{value:{type:"bytes",id:1}}}});ue("field_mask",{FieldMask:{fields:{paths:{rule:"repeated",type:"string",id:1}}}});ue.get=function(e){return ue[e]||null};var we=dn.exports=yr;we.build="full";we.tokenize=Cn;we.parse=Ar;we.common=qr;we.Root._configure(we.Type,we.parse,we.common);var Vr=dn.exports,$r=Vr;const Ur=Vn($r);function Pn(s){if(s==null)return"";const e=String(s).replace(/0x/gi,"").replace(/[\s,:_-]/g,"");if(e&&!/^[0-9a-fA-F]+$/.test(e))throw new Error("not a hex string");if(e.length%2!==0)throw new Error("hex has an odd number of nibbles");return e.toLowerCase()}const Tt=s=>{const e=new Uint8Array(s.length/2);for(let i=0;i<e.length;i++)e[i]=parseInt(s.substr(i*2,2),16);return e},Oe=s=>Array.from(s).map(e=>e.toString(16).padStart(2,"0")).join("");function Jr(s){let e=String(s||"");e=e.replace(/^\s*import\s+(?:public\s+|weak\s+)?"[^"]*"\s*;/gm,"");const i=/google\.protobuf\.Any/.test(e);i&&(e=e.replace(/google\.protobuf\.Any/g,"__GP_Any"));const c=new Set;for(const o of e.matchAll(/^\s*(?:message|enum)\s+([A-Za-z_][\w]*)/gm))c.add(o[1]);const u=new Set(["double","float","int32","int64","uint32","uint64","sint32","sint64","fixed32","fixed64","sfixed32","sfixed64","bool","string","bytes"]),a=new Set;for(const o of e.matchAll(/^\s*(?:repeated\s+|optional\s+|required\s+)?([A-Za-z_][\w.]*)\s+[A-Za-z_]\w*\s*=\s*\d+/gm)){let t=o[1];if(u.has(t)||t==="map"||t==="__GP_Any"||t==="oneof"||t==="group")continue;const r=t.split(".")[0];!c.has(r)&&!c.has(t)&&a.add(t.replace(/\./g,"_")),!c.has(r)&&t.includes(".")&&(e=e.replace(new RegExp(t.replace(/\./g,"\\."),"g"),t.replace(/\./g,"_")))}let n="";i&&(n+=`message __GP_Any { string type_url = 1; bytes value = 2; }
`);for(const o of a)o!=="__GP_Any"&&(n+=`message ${o} {}
`);return/^\s*package\s+[\w.]+\s*;/m.test(e)?e=e.replace(/(^\s*package\s+[\w.]+\s*;)/m,`$1
${n}`):e=n+e,{text:e,anyTypeName:i?"__GP_Any":null}}function Wr(s){const{text:e,anyTypeName:i}=Jr(s);let c;try{c=Ur.parse(e,{keepCase:!0}).root}catch(a){throw new Error("proto parse error: "+a.message)}try{c.resolveAll()}catch{}const u=[];return function a(n){for(const o in n.nested||{}){const t=n.nested[o];t.fieldsArray&&u.push({fullName:t.fullName.replace(/^\./,""),name:t.name}),a(t)}}(c),u.sort((a,n)=>a.fullName.localeCompare(n.fullName)),{root:c,messages:u,anyTypeName:i}}function Hr(s,e,i,c){const u=s.lookupType(e),a=Tt(Pn(i)),n=u.decode(a);return Rt(s,u,n,c)}function Zr(s,e,i,c){const u=Pn(i);if(!u)throw new Error("no data to decode");const a=[{hex:u,note:""}];for(const o of[2,1,3])u.length>o*2&&a.push({hex:u.slice(o*2),note:" (skipped "+o+" leading byte"+(o>1?"s":"")+")"});let n;for(const o of a)try{return{rows:Hr(s,e,o.hex,c),note:o.note}}catch(t){n=t}throw new Error("could not decode as "+e+": "+(n&&n.message?n.message:"invalid protobuf"))}function Rt(s,e,i,c){const u=e.toObject(i,{longs:String,enums:String,bytes:"array",defaults:!1,arrays:!0,objects:!0}),a=[];for(const n of e.fieldsArray){const o=n.name;if(!(o in u))continue;let t=u[o];const r=n.repeated?`repeated ${n.type}`:n.type;if(n.map){a.push({name:o,type:`map<${n.keyType},${n.type}>`,kind:"map",value:JSON.stringify(Kr(t))});continue}if(n.repeated){const l=Array.isArray(t)?t:[t],f=l.map((d,p)=>cn(s,n,d,`[${p}]`,c));a.push({name:o,type:r,kind:"repeated",count:l.length,children:f});continue}a.push(cn(s,n,t,o,c))}return a}function cn(s,e,i,c,u){const a=e.type;if(a==="bytes"){const n=Array.isArray(i)?Oe(Uint8Array.from(i)):Oe(i),o={name:c,type:"bytes",kind:"bytes",value:"0x"+n,bytesLen:n.length/2},t=Dn(n);t&&(o.ascii=t);const r=It(s,n);return r&&(o.children=r),o}if(e.resolvedType&&e.resolvedType.fieldsArray){if(u&&(e.type===u||e.resolvedType.name===u))return Gr(s,i,c,u);const n=s.lookupType(e.resolvedType.fullName),o=Rt(s,n,n.fromObject(i),u);return{name:c,type:e.type,kind:"message",children:o}}return{name:c,type:a,kind:e.resolvedType?"enum":"scalar",value:String(i)}}function Gr(s,e,i,c){const u=e.type_url||e.typeUrl||"",a=Array.isArray(e.value)?Oe(Uint8Array.from(e.value)):Oe(e.value||new Uint8Array),n={name:i,type:"google.protobuf.Any",kind:"any",typeUrl:u,value:"0x"+a,children:[]},o=u.split("/").pop();let t=null;if(o)try{const r=s.lookupType(o);t=Rt(s,r,r.decode(Tt(a)),c)}catch{}return t||(t=It(s,a)),n.children=t||[],n.resolvedType=t&&o?o:null,n}function It(s,e){const i=Tt(e);if(i.length<2)return null;try{const c=[];let u=0;for(;u<i.length;){const[a,n]=at(i,u);u=n;const o=Number(a>>3n),t=Number(a&7n);if(o===0)return null;if(t===0){const[r,l]=at(i,u);u=l,c.push({name:`#${o}`,type:"varint",kind:"scalar",value:r.toString()})}else if(t===2){const[r,l]=at(i,u);u=l;const f=Number(r);if(u+f>i.length)return null;const d=i.subarray(u,u+f);u+=f;const p=Oe(d),m={name:`#${o}`,type:"bytes",kind:"bytes",value:"0x"+p,bytesLen:f},y=Dn(p);y&&(m.ascii=y);const S=It(s,p);S&&(m.children=S),c.push(m)}else if(t===5){if(u+4>i.length)return null;c.push({name:`#${o}`,type:"fixed32",kind:"scalar",value:"0x"+Oe(i.subarray(u,u+4))}),u+=4}else if(t===1){if(u+8>i.length)return null;c.push({name:`#${o}`,type:"fixed64",kind:"scalar",value:"0x"+Oe(i.subarray(u,u+8))}),u+=8}else return null}return c.length?c:null}catch{return null}}function at(s,e){let i=0n,c=0n,u=0;for(;;){if(e>=s.length)throw new Error("eof");const a=s[e++];if(c|=BigInt(a&127)<<i,!(a&128))break;if(i+=7n,++u>10)throw new Error("varint too long")}return[c,e]}function Dn(s){if(!s)return"";let e="";for(let i=0;i<s.length;i+=2){const c=parseInt(s.slice(i,i+2),16);if(c<32||c>126)return"";e+=String.fromCharCode(c)}return e.length>=2?e:""}function Kr(s){const e={};for(const i in s)e[i]=Array.isArray(s[i])?"0x"+Oe(Uint8Array.from(s[i])):s[i];return e}const hn=`syntax = "proto3";

import "google/protobuf/any.proto";
import "core/Discover.proto";
import "core/contract/common.proto";

package protocol;

option java_package = "org.tron.protos"; //Specify the name of the package that generated the Java file
option java_outer_classname = "Protocol"; //Specify the class name of the generated Java file
option go_package = "github.com/tronprotocol/protocol/core";

enum AccountType {
  Normal = 0;
  AssetIssue = 1;
  Contract = 2;
}

// AccountId, (name, address) use name, (null, address) use address, (name, null) use name,
message AccountId {
  bytes name = 1;
  bytes address = 2;
}

// vote message
message Vote {
  // the super rep address
  bytes vote_address = 1;
  // the vote num to this super rep.
  int64 vote_count = 2;
}

// Proposal
message Proposal {
  int64 proposal_id = 1;
  bytes proposer_address = 2;
  map<int64, int64> parameters = 3;
  int64 expiration_time = 4;
  int64 create_time = 5;
  repeated bytes approvals = 6;
  enum State {
    PENDING = 0;
    DISAPPROVED = 1;
    APPROVED = 2;
    CANCELED = 3;
  }
  State state = 7;
}

// Exchange
message Exchange {
  int64 exchange_id = 1;
  bytes creator_address = 2;
  int64 create_time = 3;
  bytes first_token_id = 6;
  int64 first_token_balance = 7;
  bytes second_token_id = 8;
  int64 second_token_balance = 9;
}

// market
message MarketOrder {
    bytes order_id = 1;
    bytes owner_address = 2;
    int64 create_time = 3;
    bytes sell_token_id = 4;
    int64 sell_token_quantity = 5;
    bytes buy_token_id = 6;
    int64 buy_token_quantity = 7; // min to receive
    int64 sell_token_quantity_remain = 9;
    // When state != ACTIVE and sell_token_quantity_return !=0,
    //it means that some sell tokens are returned to the account due to insufficient remaining amount
    int64 sell_token_quantity_return = 10;

    enum State {
      ACTIVE = 0;
      INACTIVE = 1;
      CANCELED = 2;
    }
    State state = 11;

    bytes prev = 12;
    bytes next = 13;
}

message MarketOrderList {
    repeated MarketOrder orders = 1;
}

message MarketOrderPairList {
  repeated MarketOrderPair orderPair = 1;
}

message MarketOrderPair{
    bytes sell_token_id = 1;
    bytes buy_token_id = 2;
}

message MarketAccountOrder {
  bytes owner_address = 1;
  repeated bytes orders = 2; // order_id list
  int64 count = 3; // active count
  int64 total_count = 4;
}

message MarketPrice {
  int64 sell_token_quantity = 1;
  int64 buy_token_quantity = 2;
}

message MarketPriceList {
  bytes sell_token_id = 1;
  bytes buy_token_id = 2;
  repeated MarketPrice prices = 3;
}

message MarketOrderIdList {
  bytes head = 1;
  bytes tail = 2;
}

message ChainParameters {
  repeated ChainParameter chainParameter = 1;
  message ChainParameter {
    string key = 1;
    int64 value = 2;
  }
}

/* Account */
message Account {
  /* frozen balance */
  message Frozen {
    int64 frozen_balance = 1; // the frozen trx or asset balance
    int64 expire_time = 2; // the expire time
  }
  // account nick name
  bytes account_name = 1;
  AccountType type = 2;
  // the create address
  bytes address = 3;
  // the trx balance
  int64 balance = 4;
  // the votes
  repeated Vote votes = 5;
  // the other asset owned by this account
  map<string, int64> asset = 6;

  // the other asset owned by this account，key is assetId
  map<string, int64> assetV2 = 56;

  // the frozen balance for bandwidth
  repeated Frozen frozen = 7;
  // bandwidth, get from frozen
  int64 net_usage = 8;
  //Frozen balance provided by other accounts to this account
  int64 acquired_delegated_frozen_balance_for_bandwidth = 41;
  //Freeze and provide balances to other accounts
  int64 delegated_frozen_balance_for_bandwidth = 42;

  int64 old_tron_power = 46;
  Frozen tron_power = 47;

  bool asset_optimized = 60;

  // this account create time
  int64 create_time = 0x09;
  // this last operation time, including transfer, voting and so on. //FIXME fix grammar
  int64 latest_opration_time = 10;
  // witness block producing allowance
  int64 allowance = 0x0B;
  // last withdraw time
  int64 latest_withdraw_time = 0x0C;
  // not used so far
  bytes code = 13;
  bool is_witness = 14;
  bool is_committee = 15;
  // frozen asset(for asset issuer)
  repeated Frozen frozen_supply = 16;
  // asset_issued_name
  bytes asset_issued_name = 17;
  bytes asset_issued_ID = 57;
  map<string, int64> latest_asset_operation_time = 18;
  map<string, int64> latest_asset_operation_timeV2 = 58;
  int64 free_net_usage = 19;
  map<string, int64> free_asset_net_usage = 20;
  map<string, int64> free_asset_net_usageV2 = 59;
  int64 latest_consume_time = 21;
  int64 latest_consume_free_time = 22;

  // the identity of this account, case insensitive
  bytes account_id = 23;

  int64 net_window_size = 24;
  bool net_window_optimized = 25;

  message AccountResource {
    // energy resource, get from frozen
    int64 energy_usage = 1;
    // the frozen balance for energy
    Frozen frozen_balance_for_energy = 2;
    int64 latest_consume_time_for_energy = 3;

    //Frozen balance provided by other accounts to this account
    int64 acquired_delegated_frozen_balance_for_energy = 4;
    //Frozen balances provided to other accounts
    int64 delegated_frozen_balance_for_energy = 5;

    // storage resource, get from market
    int64 storage_limit = 6;
    int64 storage_usage = 7;
    int64 latest_exchange_storage_time = 8;

    int64 energy_window_size = 9;

    int64 delegated_frozenV2_balance_for_energy = 10;
    int64 acquired_delegated_frozenV2_balance_for_energy = 11;
    bool energy_window_optimized = 12;
  }
  AccountResource account_resource = 26;
  bytes codeHash = 30;
  Permission owner_permission = 31;
  Permission witness_permission = 32;
  repeated Permission active_permission = 33;

  message FreezeV2 {
    ResourceCode type = 1;
    int64 amount = 2;
  }
  message UnFreezeV2 {
    ResourceCode type = 1;
    int64 unfreeze_amount = 3;
    int64 unfreeze_expire_time = 4;
  }
  repeated FreezeV2 frozenV2 = 34;
  repeated UnFreezeV2 unfrozenV2 = 35;

  int64 delegated_frozenV2_balance_for_bandwidth = 36;
  int64 acquired_delegated_frozenV2_balance_for_bandwidth = 37;
}

message Key {
  bytes address = 1;
  int64 weight = 2;
}

message DelegatedResource {
  bytes from = 1;
  bytes to = 2;
  int64 frozen_balance_for_bandwidth = 3;
  int64 frozen_balance_for_energy = 4;
  int64 expire_time_for_bandwidth = 5;
  int64 expire_time_for_energy = 6;
}

message authority {
  AccountId account = 1;
  bytes permission_name = 2;
}

message Permission {
  enum PermissionType {
    Owner = 0;
    Witness = 1;
    Active = 2;
  }
  PermissionType type = 1;
  int32 id = 2; //Owner id=0, Witness id=1, Active id start by 2
  string permission_name = 3;
  int64 threshold = 4;
  int32 parent_id = 5;
  bytes operations = 6; //1 bit 1 contract
  repeated Key keys = 7;
}

// Witness
message Witness {
  bytes address = 1;
  int64 voteCount = 2;
  bytes pubKey = 3;
  string url = 4;
  int64 totalProduced = 5;
  int64 totalMissed = 6;
  int64 latestBlockNum = 7;
  int64 latestSlotNum = 8;
  bool isJobs = 9;
}

// Vote Change
message Votes {
  bytes address = 1;
  repeated Vote old_votes = 2;
  repeated Vote new_votes = 3;
}

// Transcation

message TXOutput {
  int64 value = 1;
  bytes pubKeyHash = 2;
}

message TXInput {
  message raw {
    bytes txID = 1;
    int64 vout = 2;
    bytes pubKey = 3;
  }
  raw raw_data = 1;
  bytes signature = 4;
}

message TXOutputs {
  repeated TXOutput outputs = 1;
}

message ResourceReceipt {
  int64 energy_usage = 1;
  int64 energy_fee = 2;
  int64 origin_energy_usage = 3;
  int64 energy_usage_total = 4;
  int64 net_usage = 5;
  int64 net_fee = 6;
  Transaction.Result.contractResult result = 7;
  int64 energy_penalty_total = 8;
}

message MarketOrderDetail {
  bytes makerOrderId = 1;
  bytes takerOrderId = 2;
  int64 fillSellQuantity = 3;
  int64 fillBuyQuantity = 4;
}

message Transaction {
  message Contract {
    enum ContractType {
      AccountCreateContract = 0;
      TransferContract = 1;
      TransferAssetContract = 2;
      VoteAssetContract = 3;
      VoteWitnessContract = 4;
      WitnessCreateContract = 5;
      AssetIssueContract = 6;
      WitnessUpdateContract = 8;
      ParticipateAssetIssueContract = 9;
      AccountUpdateContract = 10;
      FreezeBalanceContract = 11;
      UnfreezeBalanceContract = 12;
      WithdrawBalanceContract = 13;
      UnfreezeAssetContract = 14;
      UpdateAssetContract = 15;
      ProposalCreateContract = 16;
      ProposalApproveContract = 17;
      ProposalDeleteContract = 18;
      SetAccountIdContract = 19;
      CustomContract = 20;
      CreateSmartContract = 30;
      TriggerSmartContract = 31;
      GetContract = 32;
      UpdateSettingContract = 33;
      ExchangeCreateContract = 41;
      ExchangeInjectContract = 42;
      ExchangeWithdrawContract = 43;
      ExchangeTransactionContract = 44;
      UpdateEnergyLimitContract = 45;
      AccountPermissionUpdateContract = 46;
      ClearABIContract = 48;
      UpdateBrokerageContract = 49;
      ShieldedTransferContract = 51;
      MarketSellAssetContract = 52;
      MarketCancelOrderContract = 53;
      FreezeBalanceV2Contract = 54;
      UnfreezeBalanceV2Contract = 55;
      WithdrawExpireUnfreezeContract = 56;
      DelegateResourceContract = 57;
      UnDelegateResourceContract = 58;
      CancelAllUnfreezeV2Contract = 59;
    }
    ContractType type = 1;
    google.protobuf.Any parameter = 2;
    bytes provider = 3;
    bytes ContractName = 4;
    int32 Permission_id = 5;
  }

  message Result {
    enum code {
      SUCESS = 0;
      FAILED = 1;
    }
    enum contractResult {
      DEFAULT = 0;
      SUCCESS = 1;
      REVERT = 2;
      BAD_JUMP_DESTINATION = 3;
      OUT_OF_MEMORY = 4;
      PRECOMPILED_CONTRACT = 5;
      STACK_TOO_SMALL = 6;
      STACK_TOO_LARGE = 7;
      ILLEGAL_OPERATION = 8;
      STACK_OVERFLOW = 9;
      OUT_OF_ENERGY = 10;
      OUT_OF_TIME = 11;
      JVM_STACK_OVER_FLOW = 12;
      UNKNOWN = 13;
      TRANSFER_FAILED = 14;
      INVALID_CODE = 15;
      // please fill in the order according to the serial number
    }
    int64 fee = 1;
    code ret = 2;
    contractResult contractRet = 3;

    string assetIssueID = 14;
    int64 withdraw_amount = 15;
    int64 unfreeze_amount = 16;
    int64 exchange_received_amount = 18;
    int64 exchange_inject_another_amount = 19;
    int64 exchange_withdraw_another_amount = 20;
    int64 exchange_id = 21;
    int64 shielded_transaction_fee = 22;


    bytes orderId = 25;
    repeated MarketOrderDetail orderDetails = 26;
    int64 withdraw_expire_amount = 27;
    map<string, int64> cancel_unfreezeV2_amount = 28;
  }

  message raw {
    bytes ref_block_bytes = 1;
    int64 ref_block_num = 3;
    bytes ref_block_hash = 4;
    int64 expiration = 8;
    repeated authority auths = 9;
    // data not used
    bytes data = 10;
    //only support size = 1,  repeated list here for extension
    repeated Contract contract = 11;
    // scripts not used
    bytes scripts = 12;
    int64 timestamp = 14;
    int64 fee_limit = 18;
  }

  raw raw_data = 1;
  // only support size = 1,  repeated list here for muti-sig extension
  repeated bytes signature = 2;
  repeated Result ret = 5;
}

message TransactionInfo {
  enum code {
    SUCESS = 0;
    FAILED = 1;
  }
  message Log {
    bytes address = 1;
    repeated bytes topics = 2;
    bytes data = 3;
  }
  bytes id = 1;
  int64 fee = 2;
  int64 blockNumber = 3;
  int64 blockTimeStamp = 4;
  repeated bytes contractResult = 5;
  bytes contract_address = 6;
  ResourceReceipt receipt = 7;
  repeated Log log = 8;
  code result = 9;
  bytes resMessage = 10;

  string assetIssueID = 14;
  int64 withdraw_amount = 15;
  int64 unfreeze_amount = 16;
  repeated InternalTransaction internal_transactions = 17;
  int64 exchange_received_amount = 18;
  int64 exchange_inject_another_amount = 19;
  int64 exchange_withdraw_another_amount = 20;
  int64 exchange_id = 21;
  int64 shielded_transaction_fee = 22;

  bytes orderId = 25;
  repeated MarketOrderDetail orderDetails = 26;
  int64 packingFee = 27;

  int64 withdraw_expire_amount = 28;
  map<string, int64> cancel_unfreezeV2_amount = 29;
}

message TransactionRet {
  int64 blockNumber = 1;
  int64 blockTimeStamp = 2;
  repeated TransactionInfo transactioninfo = 3;
}

message Transactions {
  repeated Transaction transactions = 1;
}

message BlockHeader {
  message raw {
    int64 timestamp = 1;
    bytes txTrieRoot = 2;
    bytes parentHash = 3;
    //bytes nonce = 5;
    //bytes difficulty = 6;
    int64 number = 7;
    int64 witness_id = 8;
    bytes witness_address = 9;
    int32 version = 10;
    bytes accountStateRoot = 11;
  }
  raw raw_data = 1;
  bytes witness_signature = 2;
}

// block
message Block {
  repeated Transaction transactions = 1;
  BlockHeader block_header = 2;
}

message ChainInventory {
  message BlockId {
    bytes hash = 1;
    int64 number = 2;
  }
  repeated BlockId ids = 1;
  int64 remain_num = 2;
}

// Inventory
message BlockInventory {
  enum Type {
    SYNC = 0;
    ADVTISE = 1;
    FETCH = 2;
  }

  message BlockId {
    bytes hash = 1;
    int64 number = 2;
  }
  repeated BlockId ids = 1;
  Type type = 2;
}

message Inventory {
  enum InventoryType {
    TRX = 0;
    BLOCK = 1;
  }
  InventoryType type = 1;
  repeated bytes ids = 2;
}

message Items {
  enum ItemType {
    ERR = 0;
    TRX = 1;
    BLOCK = 2;
    BLOCKHEADER = 3;
  }

  ItemType type = 1;
  repeated Block blocks = 2;
  repeated BlockHeader block_headers = 3;
  repeated Transaction transactions = 4;
}

// DynamicProperties
message DynamicProperties {
  int64 last_solidity_block_num = 1;
}

enum ReasonCode {
  REQUESTED = 0x00;
  BAD_PROTOCOL = 0x02;
  TOO_MANY_PEERS = 0x04;
  DUPLICATE_PEER = 0x05;
  INCOMPATIBLE_PROTOCOL = 0x06;
  RANDOM_ELIMINATION = 0x07;
  PEER_QUITING = 0x08;
  UNEXPECTED_IDENTITY = 0x09;
  LOCAL_IDENTITY = 0x0A;
  PING_TIMEOUT = 0x0B;
  USER_REASON = 0x10;
  RESET = 0x11;
  SYNC_FAIL = 0x12;
  FETCH_FAIL = 0x13;
  BAD_TX = 0x14;
  BAD_BLOCK = 0x15;
  FORKED = 0x16;
  UNLINKABLE = 0x17;
  INCOMPATIBLE_VERSION = 0x18;
  INCOMPATIBLE_CHAIN = 0x19;
  TIME_OUT = 0x20;
  CONNECT_FAIL = 0x21;
  TOO_MANY_PEERS_WITH_SAME_IP = 0x22;
  LIGHT_NODE_SYNC_FAIL = 0x23;
  BELOW_THAN_ME = 0x24;
  NOT_WITNESS = 0x25;
  NO_SUCH_MESSAGE = 0x26;
  UNKNOWN = 0xFF;
}

message DisconnectMessage {
  ReasonCode reason = 1;
}

message HelloMessage {
  message BlockId {
    bytes hash = 1;
    int64 number = 2;
  }

  Endpoint from = 1;
  int32 version = 2;
  int64 timestamp = 3;
  BlockId genesisBlockId = 4;
  BlockId solidBlockId = 5;
  BlockId headBlockId = 6;
  bytes address = 7;
  bytes signature = 8;
  int32 nodeType = 9;
  int64 lowestBlockNum = 10;
  bytes codeVersion = 11;
}

message InternalTransaction {
  // internalTransaction identity, the root InternalTransaction hash
  // should equals to root transaction id.
  bytes hash = 1;
  // the one send trx (TBD: or token) via function
  bytes caller_address = 2;
  // the one recieve trx (TBD: or token) via function
  bytes transferTo_address = 3;
  message CallValueInfo {
    // trx (TBD: or token) value
    int64 callValue = 1;
    // TBD: tokenName, trx should be empty
    string tokenId = 2;
  }
  repeated CallValueInfo callValueInfo = 4;
  bytes note = 5;
  bool rejected = 6;
  string extra = 7;
}

message DelegatedResourceAccountIndex {
  bytes account = 1;
  repeated bytes fromAccounts = 2;
  repeated bytes toAccounts = 3;
  int64 timestamp = 4;
}

message NodeInfo {
  int64 beginSyncNum = 1;
  string block = 2;
  string solidityBlock = 3;
  //connect information
  int32 currentConnectCount = 4;
  int32 activeConnectCount = 5;
  int32 passiveConnectCount = 6;
  int64 totalFlow = 7;
  repeated PeerInfo peerInfoList = 8;
  ConfigNodeInfo configNodeInfo = 9;
  MachineInfo machineInfo = 10;
  map<string, string> cheatWitnessInfoMap = 11;

  message PeerInfo {
    string lastSyncBlock = 1;
    int64 remainNum = 2;
    int64 lastBlockUpdateTime = 3;
    bool syncFlag = 4;
    int64 headBlockTimeWeBothHave = 5;
    bool needSyncFromPeer = 6;
    bool needSyncFromUs = 7;
    string host = 8;
    int32 port = 9;
    string nodeId = 10;
    int64 connectTime = 11;
    double avgLatency = 12;
    int32 syncToFetchSize = 13;
    int64 syncToFetchSizePeekNum = 14;
    int32 syncBlockRequestedSize = 15;
    int64 unFetchSynNum = 16;
    int32 blockInPorcSize = 17;
    string headBlockWeBothHave = 18;
    bool isActive = 19;
    int32 score = 20;
    int32 nodeCount = 21;
    int64 inFlow = 22;
    int32 disconnectTimes = 23;
    string localDisconnectReason = 24;
    string remoteDisconnectReason = 25;
  }

  message ConfigNodeInfo {
    string codeVersion = 1;
    string p2pVersion = 2;
    int32 listenPort = 3;
    bool discoverEnable = 4;
    int32 activeNodeSize = 5;
    int32 passiveNodeSize = 6;
    int32 sendNodeSize = 7;
    int32 maxConnectCount = 8;
    int32 sameIpMaxConnectCount = 9;
    int32 backupListenPort = 10;
    int32 backupMemberSize = 11;
    int32 backupPriority = 12;
    int32 dbVersion = 13;
    int32 minParticipationRate = 14;
    bool supportConstant = 15;
    double minTimeRatio = 16;
    double maxTimeRatio = 17;
    int64 allowCreationOfContracts = 18;
    int64 allowAdaptiveEnergy = 19;
  }

  message MachineInfo {
    int32 threadCount = 1;
    int32 deadLockThreadCount = 2;
    int32 cpuCount = 3;
    int64 totalMemory = 4;
    int64 freeMemory = 5;
    double cpuRate = 6;
    string javaVersion = 7;
    string osName = 8;
    int64 jvmTotalMemory = 9;
    int64 jvmFreeMemory = 10;
    double processCpuRate = 11;
    repeated MemoryDescInfo memoryDescInfoList = 12;
    repeated DeadLockThreadInfo deadLockThreadInfoList = 13;

    message MemoryDescInfo {
      string name = 1;
      int64 initSize = 2;
      int64 useSize = 3;
      int64 maxSize = 4;
      double useRate = 5;
    }

    message DeadLockThreadInfo {
      string name = 1;
      string lockName = 2;
      string lockOwner = 3;
      string state = 4;
      int64 blockTime = 5;
      int64 waitTime = 6;
      string stackTrace = 7;
    }
  }
}

message MetricsInfo {
  int64 interval = 1;
  NodeInfo node = 2;
  BlockChainInfo blockchain = 3;
  NetInfo net = 4;

  message NodeInfo {
    string ip = 1;
    int32 nodeType = 2;
    string version = 3;
    int32 backupStatus = 4;
  }

  message BlockChainInfo {
    int64 headBlockNum = 1;
    int64 headBlockTimestamp = 2;
    string headBlockHash = 3;
    int32 forkCount = 4;
    int32 failForkCount = 5;
    RateInfo blockProcessTime = 6;
    RateInfo tps = 7;
    int32 transactionCacheSize = 8;
    RateInfo missedTransaction = 9;
    repeated Witness witnesses = 10;
    int64 failProcessBlockNum = 11;
    string failProcessBlockReason = 12;
    repeated DupWitness dupWitness = 13;

    message Witness {
      string address = 1;
      int32 version = 2;
    }

    message DupWitness {
      string address = 1;
      int64 blockNum = 2;
      int32 count = 3;
    }
  }

  message RateInfo {
    int64 count = 1;
    double meanRate = 2;
    double oneMinuteRate = 3;
    double fiveMinuteRate = 4;
    double fifteenMinuteRate = 5;
  }

  message NetInfo {
    int32 errorProtoCount = 1;
    ApiInfo api = 2;
    int32 connectionCount = 3;
    int32 validConnectionCount = 4;
    RateInfo tcpInTraffic = 5;
    RateInfo tcpOutTraffic = 6;
    int32 disconnectionCount = 7;
    repeated DisconnectionDetailInfo disconnectionDetail = 8;
    RateInfo udpInTraffic = 9;
    RateInfo udpOutTraffic = 10;
    LatencyInfo latency = 11;

    message ApiInfo {
      RateInfo qps = 1;
      RateInfo failQps = 2;
      RateInfo outTraffic = 3;
      repeated ApiDetailInfo detail = 4;

      message ApiDetailInfo {
        string name = 1;
        RateInfo qps = 2;
        RateInfo failQps = 3;
        RateInfo outTraffic = 4;
      }
    }

    message DisconnectionDetailInfo {
      string reason = 1;
      int32 count = 2;
    }

    message LatencyInfo {
      int32 top99 = 1;
      int32 top95 = 2;
      int32 top75 = 3;
      int32 totalCount = 4;
      int32 delay1S = 5;
      int32 delay2S = 6;
      int32 delay3S = 7;
      repeated LatencyDetailInfo detail = 8;

      message LatencyDetailInfo {
        string witness = 1;
        int32 top99 = 2;
        int32 top95 = 3;
        int32 top75 = 4;
        int32 count = 5;
        int32 delay1S = 6;
        int32 delay2S = 7;
        int32 delay3S = 8;
      }
    }
  }
}

message PBFTMessage {
  enum MsgType {
    VIEW_CHANGE = 0;
    REQUEST = 1;
    PREPREPARE = 2;
    PREPARE = 3;
    COMMIT = 4;
  }
  enum DataType {
    BLOCK = 0;
    SRL = 1;
  }
  message Raw {
    MsgType msg_type = 1;
    DataType data_type = 2;
    int64 view_n = 3;
    int64 epoch = 4;
    bytes data = 5;
  }
  Raw raw_data = 1;
  bytes signature = 2;
}

message PBFTCommitResult {
  bytes data = 1;
  repeated bytes signature = 2;
}

message SRL {
  repeated bytes srAddress = 1;
}
`,ut="protocol.Transaction.raw",Xr="0a02bb20220805f0a853eb134a3d4090b89ae4e4315a68080112640a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412330a154199dba6501d5fc2da5a68a49a8cfc63b452db509f1215415a9cf0e3610566f672c5d127e1c1d47036a4dbaa18e8eae10270c7e696e4e431";function ni(){const[s,e]=ve.useState(hn),[i,c]=ve.useState(Xr),[u,a]=ve.useState(ut),[n,o]=ve.useState(!0),[t,r]=ve.useState(!1),l=ve.useMemo(()=>{if(!s.trim())return{ok:!1,error:"paste a .proto schema"};try{return{ok:!0,...Wr(s)}}catch(d){return{ok:!1,error:d.message}}},[s]);ve.useEffect(()=>{if(!l.ok)return;const d=l.messages.map(p=>p.fullName);d.includes(u)||a(d.includes(ut)?ut:d[0]||"")},[l]);const f=ve.useMemo(()=>{if(!l.ok||!u||!i.trim())return null;try{return{ok:!0,...Zr(l.root,u,i,l.anyTypeName)}}catch(d){return{ok:!1,error:d.message}}},[l,u,i]);return x.jsxs("div",{className:"pb",children:[x.jsx("div",{className:"pb-bg"}),x.jsxs("div",{className:"pb-card",children:[x.jsx("h2",{className:"pb-title",children:"Protobuf Parser"}),x.jsxs("p",{className:"pb-sub",children:["Decode Protocol Buffers wire bytes against a ",x.jsx("code",{children:".proto"})," schema. Paste the data and a schema (Tron’s is loaded by default), pick the message, and see every field named and typed — with ",x.jsx("code",{children:"google.protobuf.Any"})," contents decoded recursively."]}),x.jsxs("button",{className:"pb-help-toggle",type:"button",onClick:()=>o(d=>!d),children:[n?"▾":"▸"," How Protocol Buffers work"]}),n&&x.jsx(Qr,{}),x.jsxs("label",{className:"pb-field",children:[x.jsx("span",{className:"pb-label",children:"Protobuf data (hex)"}),x.jsx("textarea",{className:"pb-mono",rows:3,spellCheck:!1,value:i,onChange:d=>c(d.target.value),placeholder:"paste the serialized protobuf message in hex"})]}),x.jsx("div",{className:"pb-row",children:x.jsxs("label",{className:"pb-field pb-grow",children:[x.jsxs("span",{className:"pb-label",children:[x.jsx("span",{children:".proto schema"}),x.jsxs("span",{className:"pb-inline",children:[l.ok&&x.jsxs("span",{className:"pb-schema-stat",children:[l.messages.length," messages"]}),x.jsxs("button",{type:"button",className:"pb-mini",onClick:()=>r(d=>!d),children:[t?"Hide":"Edit"," schema"]}),x.jsx("button",{type:"button",className:"pb-mini",onClick:()=>e(hn),title:"reset to the bundled Tron.proto",children:"Reset to Tron"})]})]}),t&&x.jsx("textarea",{className:"pb-mono pb-proto",rows:10,spellCheck:!1,value:s,onChange:d=>e(d.target.value),placeholder:"paste a .proto schema (imports are stripped, unknown types stubbed)"})]})}),x.jsx("div",{className:"pb-row",children:x.jsxs("label",{className:"pb-field pb-grow",children:[x.jsxs("span",{className:"pb-label",children:["Root message ",x.jsx("em",{children:"· decode the bytes as this message"})]}),x.jsx("select",{className:"pb-sel",value:u,onChange:d=>a(d.target.value),disabled:!l.ok,children:l.ok&&l.messages.map(d=>x.jsx("option",{value:d.fullName,children:d.fullName},d.fullName))})]})}),!l.ok&&x.jsxs("div",{className:"pb-err",children:["⚠ ",l.error]}),(f==null?void 0:f.ok)&&x.jsxs(x.Fragment,{children:[x.jsxs("div",{className:"pb-section-title",children:["Decoded ",x.jsxs("em",{children:["· ",u,f.note]})]}),x.jsx(Yr,{rows:f.rows})]}),f&&!f.ok&&x.jsxs("div",{className:"pb-err",children:["⚠ ",f.error]})]})]})}function Yr({rows:s}){return x.jsx("div",{className:"pb-tree",children:s.map((e,i)=>x.jsx(jn,{r:e},i))})}function jn({r:s}){const e="pb-node "+(s.kind||"scalar");return x.jsxs("div",{className:e,children:[x.jsxs("div",{className:"pb-node-line",children:[x.jsx("span",{className:"pb-name",children:s.name}),x.jsx("span",{className:"pb-type",children:s.type}),s.kind==="enum"&&x.jsx("span",{className:"pb-badge enum",children:"enum"}),s.kind==="any"&&x.jsx("span",{className:"pb-badge any",children:"Any"}),s.count!=null&&x.jsxs("span",{className:"pb-badge",children:["×",s.count]}),s.value!==void 0&&x.jsx("span",{className:"pb-val"+(s.kind==="enum"?" enumval":""),children:s.value}),s.ascii&&x.jsxs("span",{className:"pb-ascii",children:["“",s.ascii,"”"]}),s.typeUrl&&x.jsxs("span",{className:"pb-url",children:[s.typeUrl,s.resolvedType?" ✓":" (raw)"]})]}),s.children&&s.children.length>0&&x.jsx("div",{className:"pb-children",children:s.children.map((i,c)=>x.jsx(jn,{r:i},c))})]})}function Qr(){return x.jsxs("div",{className:"pb-help",children:[x.jsxs("p",{children:[x.jsx("b",{children:"Protocol Buffers"})," (protobuf) is Google’s compact binary serialization. A ",x.jsx("code",{children:".proto"})," schema declares ",x.jsx("i",{children:"messages"})," (structs) whose fields each have a ",x.jsx("b",{children:"name"}),", a ",x.jsx("b",{children:"type"}),", and a small ",x.jsx("b",{children:"field number"}),". The number — not the name — is what’s written on the wire, so messages stay tiny and forward-compatible."]}),x.jsxs("p",{className:"pb-help-rules-title",children:["On the wire, each field is ",x.jsx("code",{children:"(field_number << 3) | wire_type"})," as a varint “tag”, then the value:"]}),x.jsxs("table",{className:"pb-rules",children:[x.jsx("thead",{children:x.jsxs("tr",{children:[x.jsx("th",{children:"Wire type"}),x.jsx("th",{children:"Used for"}),x.jsx("th",{children:"Value encoding"})]})}),x.jsxs("tbody",{children:[x.jsxs("tr",{children:[x.jsxs("td",{children:[x.jsx("code",{children:"0"})," varint"]}),x.jsx("td",{children:"int32/64, uint, sint, bool, enum"}),x.jsx("td",{children:"base-128, 7 bits/byte, MSB = “more”"})]}),x.jsxs("tr",{children:[x.jsxs("td",{children:[x.jsx("code",{children:"1"})," 64-bit"]}),x.jsx("td",{children:"fixed64, sfixed64, double"}),x.jsx("td",{children:"8 little-endian bytes"})]}),x.jsxs("tr",{children:[x.jsxs("td",{children:[x.jsx("code",{children:"2"})," length-delimited"]}),x.jsx("td",{children:"string, bytes, embedded message, packed repeated"}),x.jsx("td",{children:"a length varint, then that many bytes"})]}),x.jsxs("tr",{children:[x.jsxs("td",{children:[x.jsx("code",{children:"5"})," 32-bit"]}),x.jsx("td",{children:"fixed32, sfixed32, float"}),x.jsx("td",{children:"4 little-endian bytes"})]})]})]}),x.jsxs("p",{className:"pb-help-ex",children:[x.jsx("b",{children:"Decoding needs the schema."})," The bytes only carry field numbers + wire types — not names or exact types. To turn ",x.jsx("code",{children:"0x08 96 01"})," into ",x.jsx("code",{children:"amount = 150"})," you must know field 1 is an ",x.jsx("code",{children:"int64"})," named “amount”. That’s why this tool takes a ",x.jsx("code",{children:".proto"}),": it maps numbers → names/types and recurses into embedded messages."]}),x.jsxs("p",{className:"pb-help-note",children:[x.jsx("b",{children:"To generate protobuf"}),", you (or a library) take each field, write its tag byte then its value per the table above, and concatenate. Nested messages are just length-delimited (wire 2) fields whose bytes are themselves an encoded message. ",x.jsx("code",{children:"google.protobuf.Any"})," wraps a ",x.jsx("code",{children:"type_url"})," + the embedded message’s bytes, so a decoder can look up the real type — this tool resolves it against your schema and decodes the inner message too."]}),x.jsxs("p",{className:"pb-help-foot",children:["Tron is the example here: its transactions are protobuf. The default ",x.jsx("code",{children:"Tron.proto"})," decodes a ",x.jsx("code",{children:"Transaction.raw"})," — its ",x.jsx("code",{children:"contract[].parameter"})," is an ",x.jsx("code",{children:"Any"})," holding e.g. a ",x.jsx("code",{children:"TransferContract"}),", which you’ll see expand inline."]})]})}export{ni as default};
