document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);

    // initialize leaflet map
    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    function handleFileSelect(event) {
       const file = event.target.files[0];

       if (file) {
          readExifData(file);
       }
    }

    // read exif data from photo
    function readExifData(file) {
       const reader = new FileReader();

       reader.onload = function (e) {
          const arrayBuffer = e.target.result;
          const exifData = EXIF.readFromBinaryFile(arrayBuffer);

          // check if location data is available
          if (exifData && exifData.GPSLatitude && exifData.GPSLongitude) {
             // convert degrees, minutes, seconds to decimal degrees
             const latitude = convertDMSToDD(exifData.GPSLatitude[0], exifData.GPSLatitude[1], exifData.GPSLatitude[2], exifData.GPSLatitudeRef);
             const longitude = convertDMSToDD(exifData.GPSLongitude[0], exifData.GPSLongitude[1], exifData.GPSLongitude[2], exifData.GPSLongitudeRef);

             // reverse latitude and longitude if needed
             L.marker([latitude, longitude]).addTo(map)
                .bindPopup('Your Photo Location').openPopup();

             // set the map view to photo location
             map.setView([latitude, longitude], 15); // zoom level
          } else {
             console.error('No GPS data available in the photo.');
          }
       };

       reader.readAsArrayBuffer(file);
    }

    // function to help convert degrees, minutes, seconds to decimal degrees
    function convertDMSToDD(degrees, minutes, seconds, direction) {
       let dd = degrees + minutes / 60 + seconds / 3600;
       return (direction === 'S' || direction === 'W') ? -dd : dd;
    }

    
});