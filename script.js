document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);

    // Leaflet map initialization
    const map = L.map('map').setView([0, 0], 2); // Initial view, you can adjust this

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

          // Check if GPS data is available
          if (exifData && exifData.GPSLatitude && exifData.GPSLongitude) {
             // Convert degrees, minutes, seconds to decimal degrees
             const latitude = convertDMSToDD(exifData.GPSLatitude[0], exifData.GPSLatitude[1], exifData.GPSLatitude[2], exifData.GPSLatitudeRef);
             const longitude = convertDMSToDD(exifData.GPSLongitude[0], exifData.GPSLongitude[1], exifData.GPSLongitude[2], exifData.GPSLongitudeRef);

             // Reverse latitude and longitude if needed
             L.marker([latitude, longitude]).addTo(map)
                .bindPopup('Your Photo Location').openPopup();

             // Set the map view to the photo location
             map.setView([latitude, longitude], 15); // Adjust the zoom level as needed
          } else {
             console.error('No GPS data available in the photo.');
          }
       };

       reader.readAsArrayBuffer(file);
    }

    // Helper function to convert degrees, minutes, seconds to decimal degrees
    function convertDMSToDD(degrees, minutes, seconds, direction) {
       let dd = degrees + minutes / 60 + seconds / 3600;
       return (direction === 'S' || direction === 'W') ? -dd : dd;
    }

    
});