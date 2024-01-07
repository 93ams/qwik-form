import {BareMatrix, ClientSide, SingleField, ZodServerSide} from "./examples";

export default () => {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        <BareMatrix/>
        <br/>
        <SingleField/>
        <br/>
        <ClientSide/>
        <br/>
        <ZodServerSide/>
      </body>
    </>
  );
};