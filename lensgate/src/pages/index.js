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
  Box, Button,Input,Textarea 
} from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from "wagmi"
import {getChallenge,Authenticate,getProfile} from "./utils";
import {lens_abi} from "./abi/lenshub";




export default function Home() {
  const[contentURI,setContentURI]=useState();
  const[profileId,setProfileID]=useState("");
  const[handle,setHandle]=useState("");
  const[follownNFTAddress,setFollowNFTAddress]=useState();

  const[post,setPost]=useState("");

  const APIURL = "https://api-mumbai.lens.dev/playground";

  const { address } = useAccount();




  async function Login(){
    const response=await getProfile(address);
    if(!response.data.defaultProfile){
      console.log("You dont have profile");
      

    }else{
      console.log("Success!!!!")
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner()
      console.log(response.data.defaultProfile)
      console.log(parseInt(response.data.defaultProfile.id))

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
      setProfileID(response.data.defaultProfile.id);
      setHandle(response.data.defaultProfile.handle)
      setFollowNFTAddress(response.data.defaultProfile.followNftAddress);
    }
  }

 
  

 



  
  // console.log(ethers.utils.hexZeroPad(ethers.utils.hexlify(27164)))

  async function gate(){
    // console.log(follownNFTAddress)
    // console.log(parseInt(profileId))
    // console.log(handle)
    // console.log(post)
    const metadata = {
      version: '2.0.0',
      content: post,
      description: "This is a gated post!",
      name: `Post by @${handle}`,
      external_url: `https://lenster.xyz/u/${handle}`,
      metadata_id: uuid(),
      mainContentFocus: 'TEXT_ONLY',
      attributes: [],
      locale: 'en-US',
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner()

    let accessCondition = {
      contractAddress:follownNFTAddress,
      chainID: 80001
    }
    let condition = {}

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
        // your ipfs function to add data
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

  let handleInputChange = (e) => {
    let inputValue = e.target.value
    setPost(inputValue)
  }
  return (
    <div>
      <Box>
      <ConnectButton/>
      </Box>
      {!profileId ? 
      <Button onClick={() =>Login()}>Login</Button>:
      <div>
        <h1>Post Tweet</h1>
        <Textarea
        value={post}
        onChange={handleInputChange}
        size='sm'
      />
      <Button onClick={() =>gate()}>POST</Button>
      </div>
      }
      
      

    </div>
  )
}
