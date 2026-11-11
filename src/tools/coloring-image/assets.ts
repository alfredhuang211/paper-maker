export interface PictureAsset {
  id: string;
  title: { zh: string; en: string };
  file: string;
  source: string;
  license: string;
}

export const PICTURE_ASSETS: PictureAsset[] = [
  {
    id: 'underwater',
    title: { zh: '海底世界', en: 'Underwater' },
    file: 'underwater.svg',
    source: 'https://openclipart.org/detail/280842/cute-underwater-scene',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'underwater2',
    title: { zh: '海底世界 2', en: 'Underwater 2' },
    file: 'underwater2.svg',
    source: 'https://openclipart.org/detail/241573/underwater',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'aquarium',
    title: { zh: '水族馆', en: 'Aquarium' },
    file: 'aquarium.svg',
    source: 'https://openclipart.org/detail/297986/aquarium',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'beach',
    title: { zh: '热带海滩', en: 'Tropical beach' },
    file: 'beach.svg',
    source: 'https://openclipart.org/detail/337417/beach-scene',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'small-town',
    title: { zh: '小城街景', en: 'Small town' },
    file: 'small-town.svg',
    source: 'https://openclipart.org/detail/203328/pequena-cidade-cenario-1',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'picnic',
    title: { zh: '野餐时光', en: 'Picnic' },
    file: 'picnic.svg',
    source: 'https://openclipart.org/detail/337339/picnic-scene',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'space',
    title: { zh: '太空探险', en: 'Space explorer' },
    file: 'space.svg',
    source: 'https://openclipart.org/detail/345105/joyful-space-explorer',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'creation',
    title: { zh: '动物乐园', en: 'Animal scene' },
    file: 'creation.svg',
    source: 'https://openclipart.org/detail/245307/creation-day-6-coloring-page',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'safari',
    title: { zh: '非洲草原', en: 'African safari' },
    file: 'safari.svg',
    source: 'https://openclipart.org/detail/331089/african-safari-scene',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'nature',
    title: { zh: '自然风光', en: 'Nature scene' },
    file: 'nature.svg',
    source: 'https://openclipart.org/detail/302561/cartoon-nature-scene',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'snow',
    title: { zh: '雪地玩耍', en: 'Snowy play' },
    file: 'snow.svg',
    source: 'https://openclipart.org/detail/326665/snowy-scene-with-kids',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'farm',
    title: { zh: '农场拖拉机', en: 'Farm tractor' },
    file: 'farm.svg',
    source: 'https://openclipart.org/detail/334634/field-and-tractor',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'silly-walks',
    title: { zh: '滑稽散步', en: 'Silly walks' },
    file: 'silly-walks.svg',
    source: 'https://openclipart.org/detail/352456/silly-walks',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'fishbowl',
    title: { zh: '鱼缸世界', en: 'Fish bowl' },
    file: 'fishbowl.svg',
    source: 'https://openclipart.org/detail/341015/fishes-in-a-bowl',
    license: 'Public Domain (Openclipart)',
  },
];

export function assetUrl(asset: PictureAsset): string {
  return `${import.meta.env.BASE_URL}coloring-images/${asset.file}`;
}
