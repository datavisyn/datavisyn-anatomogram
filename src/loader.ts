

/**
 * loads the file internally
 */
export default function loader(fileName: string) {
  //!! to a request will disable configured loaders
  return System.import(`!!raw-loader!../resources/${fileName}`);
}
