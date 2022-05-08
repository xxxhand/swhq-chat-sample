export enum AdvertisementLocation {
  LT = 'LT',
  RT = 'RT',
  LM = 'LM',
  LR = 'LR',
};

export enum AdvertisementType {
  BROADCAST = 'broadcast',
  ADVERTISEMENT = 'advertisement',
};

export class AdvertisementMessage {
  public content: string = '';
  public img: string = '';
  public linkUrl: string = '';
  public location: AdvertisementLocation = AdvertisementLocation.LT;
  public type: AdvertisementType = AdvertisementType.ADVERTISEMENT;
};
