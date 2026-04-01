// Weather widget: fetches current weather from Open-Meteo using browser geolocation
(function(){
  const elTemp = document.getElementById('weather-temp');
  const elDesc = document.getElementById('weather-desc');
  const elEmoji = document.getElementById('weather-emoji');
  const elMeta = document.getElementById('weather-meta');

  function codeToEmoji(code){
    if(code === 0) return '☀️';
    if(code >= 1 && code <= 3) return '🌤️';
    if(code >= 45 && code <= 48) return '🌫️';
    if((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
    if(code >= 71 && code <= 77) return '❄️';
    if(code >= 95 && code <= 99) return '⛈️';
    return '☁️';
  }

  function codeToDesc(code){
    if(code === 0) return 'Clear';
    if(code >= 1 && code <= 3) return 'Partly cloudy';
    if(code >= 45 && code <= 48) return 'Fog';
    if((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rain';
    if(code >= 71 && code <= 77) return 'Snow';
    if(code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Cloudy';
  }

  function setLoading(){ elTemp.textContent='—°F'; elDesc.textContent='Loading…'; elEmoji.textContent='⏳'; elMeta.textContent=''; }
  function setError(msg){ elTemp.textContent='—'; elDesc.textContent=msg; elEmoji.textContent='❌'; elMeta.textContent=''; }

  setLoading();

  if(!navigator.geolocation){ setError('Geolocation not supported'); return; }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    try{
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&timezone=auto`;
      const resp = await fetch(url);
      if(!resp.ok) throw new Error('Network error');
      const data = await resp.json();
      const cw = data.current_weather;
      if(!cw) throw new Error('No current weather');
      const temp = Math.round(cw.temperature);
      const code = cw.weathercode;
      elTemp.textContent = `${temp}°F`;
      elEmoji.textContent = codeToEmoji(code);
      elDesc.textContent = codeToDesc(code);
      elMeta.textContent = `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
    }catch(e){ setError('Unable to fetch weather'); }
  }, (err)=>{
    // Friendly fallback messages for geolocation errors
    if (err && err.code === 1) { // PERMISSION_DENIED
      setError('Enable location to see your weather.');
    } else if (err && err.code === 3) { // TIMEOUT
      setError('Location request timed out');
    } else {
      setError('Unable to get location');
    }
  }, {timeout:10000, maximumAge:600000});
})();
