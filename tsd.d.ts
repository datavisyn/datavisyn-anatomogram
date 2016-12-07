
//allow sass modules
declare module "*.scss" {
  const content:string;
  export default content;
}

declare module "*.json" {
  const content:any;
  export default content;
}


//define System.import as understood by webpack2
interface ISystem {
  import(module: string): Promise<any>;
}
declare const System: ISystem;
