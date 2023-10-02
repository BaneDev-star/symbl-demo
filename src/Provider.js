
import { SymblProvider } from '@symblai/react-elements';
export default function Provider({ children }) {

  const symblConfig = {
    appId: process.env.REACT_APP_SYMBL_APP_ID,
    appSecret: process.env.REACT_APP_SYMBL_APP_SECRET,
  };
  return (
    <SymblProvider config={symblConfig}>
      {children}
    </SymblProvider>
  );

}