import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { ChakraProvider } from "@chakra-ui/react"

const { chains, provider } = configureChains(
    [polygonMumbai], [
        publicProvider()
    ]
);

const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    chains
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider
})

export default function App({ Component, pageProps }) {
    return(
      <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
          <ChakraProvider>
               <Component {...pageProps} />
          </ChakraProvider>
      </RainbowKitProvider>
  </WagmiConfig>
    )
}