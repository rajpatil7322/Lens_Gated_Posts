import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from 'react'
import { ethers } from "ethers";
import { v4 as uuid } from 'uuid'
import { ContractType, LensGatedSDK, LensEnvironment, ScalarOperator } from '@lens-protocol/sdk-gated'
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Box, Button,Input,Lin 
} from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from "wagmi"
import {getChallenge,Authenticate,getProfile} from "./utils";




export default function Home() {
  const[contentURI,setContentURI]=useState();
  const[profileId,setProfileID]=useState("");
  const[handle,setHandle]=useState("");

  const APIURL = 'https://api-mumbai.lens.dev/';

  const { address } = useAccount();




  async function Login(){
    const response=await getProfile(address);
    if(!response.data.defaultProfile){
      console.log("You dont have profile");

    }else{
      console.log("Success!!!!")
      setProfileID(response.data.defaultProfile.id);
      setHandle(response.data.defaultProfile.handle)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner() 
      await getChallenge(address).then(async(data)=>{
        return await signer.signMessage(data)
      }).then(async(sig) =>{
        const response=await Authenticate(address,sig);
        const accessToken=response.accessToken;
        const refreshToken=response.refreshToken;
        localStorage.setItem("Tokens", JSON.stringify({
          accessToken, refreshToken,
        }))
      })
    
    }
  }

 
  

  let accessCondition = {
    contractAddress:"0x0DcF37Fc2000388e348Ed2252De7d6A5C00199E5",
    chainID: 80001
  }
  let condition = {}



  const metadata = {
    version: '2.0.0',
    content: "I love you",
    description: "This is a gated post!",
    name: `Post by @${handle}`,
    external_url: `https://lenster.xyz/u/${handle}`,
    metadata_id: uuid(),
    mainContentFocus: 'TEXT_ONLY',
    attributes: [],
    locale: 'en-US',
  }
  // console.log(ethers.utils.hexZeroPad(ethers.utils.hexlify(27164)))

  async function gate(){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()
    const sdk = await LensGatedSDK.create({
      provider: new ethers.providers.Web3Provider(window.ethereum),
      signer: provider.getSigner(),
      env: LensEnvironment.Mumbai
    })
    accessCondition.contractType = ContractType.Erc721
    condition = {
      nft: accessCondition
    }
    const { contentURI, encryptedMetadata } = await sdk.gated.encryptMetadata(
      metadata,
      profileId,
      {
       ...condition
      },
      async function(EncryptedMetadata) {
        return EncryptedMetadata
      },)
      setContentURI(contentURI)
      console.log(encryptedMetadata);
  }

  async function decrypt(){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()
    const sdk = await LensGatedSDK.create({
      provider: new ethers.providers.Web3Provider(window.ethereum),
      signer: provider.getSigner(),
      env: LensEnvironment.Mumbai
    })
    const { decrypted } = await sdk.gated.decryptMetadata(contentURI)
    console.log({ decrypted })
  }
  return (
    <div>
      <Box>
      <ConnectButton/>
      </Box>
      <Button onClick={() =>Login()}>Login</Button>
      {/* <button onClick={() =>gate()}>Gate</button>
      <button onClick={() =>decrypt()}>Decrypt</button> */}

    </div>
  )
}
