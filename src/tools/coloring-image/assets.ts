export interface PictureAsset {
  id: string;
  title: { zh: string; en: string };
  file: string;
  source: string;
  license: string;
}

export const PICTURE_ASSETS: PictureAsset[] = [
  {
    id: 'triceratops',
    title: { zh: '三角龙', en: 'Triceratops' },
    file: 'triceratops.svg',
    source: 'https://openclipart.org/detail/316177/white-cartoon-triceratops',
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
    id: 'underwater',
    title: { zh: '海底世界', en: 'Underwater' },
    file: 'underwater.svg',
    source: 'https://openclipart.org/detail/280842/cute-underwater-scene',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'cat',
    title: { zh: '猫咪', en: 'Cat' },
    file: 'cat.svg',
    source: 'https://openclipart.org/detail/25657/fighting-cat-bw',
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
    id: 'silly-walks',
    title: { zh: '滑稽散步', en: 'Silly walks' },
    file: 'silly-walks.svg',
    source: 'https://openclipart.org/detail/352456/silly-walks',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'stegosaurus',
    title: { zh: '剑龙', en: 'Stegosaurus' },
    file: 'stegosaurus.svg',
    source: 'https://openclipart.org/detail/339881/stegosaurus-cartoon',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'firefighting',
    title: { zh: '消防现场', en: 'Firefighting scene' },
    file: 'firefighting.svg',
    source: 'https://openclipart.org/detail/321747/firefighting-scene',
    license: 'Public Domain (Openclipart)',
  },
];

export function assetUrl(asset: PictureAsset): string {
  return `${import.meta.env.BASE_URL}coloring-images/${asset.file}`;
}
