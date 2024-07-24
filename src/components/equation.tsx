import katex from 'katex';
import 'katex/dist/katex.min.css';
import { PropsWithChildren } from 'react';

function render(expression: string, displayMode: boolean): string {
  let result: string;
  try {
    result = katex.renderToString(expression, { displayMode });
  } catch (e) {
    if (e instanceof katex.ParseError) {
      result = e.message;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error(e);
    }
  }
  return result;
}

const Equation = ({ children, displayMode = true }: PropsWithChildren<any>) => {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: render(children, displayMode),
      }}
    />
  );
}

export default Equation;