import { el, setChildren } from 'redom';
import ymaps from 'ymaps';
import { requestAtm } from './requests';
import '../styles.scss';
import '../media.scss';

function initYandexMap() {
  const mapContainer = el('div.atm__map.skeleton');

  ymaps
    .load(
      'https://api-maps.yandex.ru/2.1/?apikey=f1fa0048-e928-447a-a621-5ccd1da5e0fc&lang=ru_RU'
    )
    .then(async (maps) => {
      const coordinatesAtm = await requestAtm(sessionStorage.getItem('token'));

      const map = new maps.Map(mapContainer, {
        center: [55.755811, 37.617617],
        zoom: 8,
      });

      coordinatesAtm.payload.forEach((coor) => {
        map.geoObjects.add(
          new maps.Placemark(
            [coor.lat, coor.lon],

            {
              balloonContent: '<strong>Coin.</strong>',
              iconImageSize: [28, 40],
            }
          )
        );
      });
      map.controls.remove('trafficControl');
      map.controls.remove('typeSelector');
      map.controls.remove('fullscreenControl');
      map.controls.remove('rulerControl');
    })
    .catch((error) => console.log('Failed to load Yandex Maps', error));

  return mapContainer;
}

// отрисовка секции банкоматов
export default function createAtmInfo() {
  if (!sessionStorage.getItem('token')) {
    throw new Error('Вы не авторизованы');
  }

  const container = el('div.atm');
  const title = el('h2.atm__title', 'Карта банкоматов');
  const ymap = initYandexMap();

  setChildren(container, [title, ymap]);

  return container;
}
