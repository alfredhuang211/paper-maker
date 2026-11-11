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
  {
    id: 'jungle',
    title: { zh: '丛林探险', en: 'Jungle adventure' },
    file: 'jungle.svg',
    source: 'https://openclipart.org/detail/326723/jungle-scene',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'beach',
    title: { zh: '热带海滩', en: 'Tropical beach' },
    file: 'beach.svg',
    source: 'https://openclipart.org/detail/347038/tropical-beach',
    license: 'Public Domain (Openclipart)',
  },
  {
    id: 'pirate',
    title: { zh: '海盗场景', en: 'Pirate scene' },
    file: 'pirate.svg',
    source: 'https://openclipart.org/detail/332258/pirate-scene',
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
    id: 'underwater2',
    title: { zh: '海底世界 2', en: 'Underwater 2' },
    file: 'underwater2.svg',
    source: 'https://openclipart.org/detail/241573/underwater',
    license: 'Public Domain (Openclipart)',
  },
];

export function assetUrl(asset: PictureAsset): string {
  return `${import.meta.env.BASE_URL}coloring-images/${asset.file}`;
}
