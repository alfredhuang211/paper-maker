export interface PictureAsset {
  id: string;
  title: { zh: string; en: string };
  file: string;
  source: string;
  license: string;
}

export const PICTURE_ASSETS: PictureAsset[] = [
  {
    id: 'butterfly',
    title: { zh: '蝴蝶', en: 'Butterfly' },
    file: 'butterfly.svg',
    source: 'https://openclipart.org/detail/354193/lutz-butterfly-e-outline',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'flower',
    title: { zh: '花朵', en: 'Flower' },
    file: 'flower.svg',
    source: 'https://openclipart.org/detail/352672/simple-flower-head-lineart',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'dinosaur',
    title: { zh: '恐龙', en: 'Dinosaur' },
    file: 'dinosaur.svg',
    source: 'https://openclipart.org/detail/281169/happy-dinosaur-outline',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'rocket',
    title: { zh: '火箭', en: 'Rocket' },
    file: 'rocket.svg',
    source: 'https://openclipart.org/detail/301370/rocket-11-outline',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'fish',
    title: { zh: '小鱼', en: 'Fish' },
    file: 'fish.svg',
    source: 'https://openclipart.org/detail/300715/carp-2-outline',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'cat',
    title: { zh: '猫咪', en: 'Cat' },
    file: 'cat.svg',
    source: 'https://openclipart.org/detail/353975/lutz-cat-front-outline',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'owl',
    title: { zh: '猫头鹰', en: 'Owl' },
    file: 'owl.svg',
    source: 'https://openclipart.org/detail/322660/owl-outline',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'unicorn',
    title: { zh: '独角兽', en: 'Unicorn' },
    file: 'unicorn.svg',
    source: 'https://openclipart.org/detail/340455/unicorn-by-tarishart-line-art',
    license: 'Public Domain (Openclipart)',
  },
];

export function assetUrl(asset: PictureAsset): string {
  return `${import.meta.env.BASE_URL}coloring-images/${asset.file}`;
}
