'use client';

import React, { useMemo, useState } from 'react';
import type { WalletError } from '@tronweb3/tronwallet-abstract-adapter';
import { WalletDisconnectedError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';
import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
/* eslint-disable */
import {
  WalletActionButton,
  WalletConnectButton,
  WalletDisconnectButton,
  WalletModalProvider,
  WalletSelectButton,
} from '@tronweb3/tronwallet-adapter-react-ui';
import toast from 'react-hot-toast';
import { TextField, Alert } from '@mui/material';
/* eslint-enable */
import { BitKeepAdapter, OkxWalletAdapter, TokenPocketAdapter, TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect';
import { tronWeb } from './tronweb';
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';
import { Button } from '@tronweb3/tronwallet-adapter-react-ui';

/**
 * wrap your app content with WalletProvider and WalletModalProvider
 * WalletProvider provide some useful properties and methods
 * WalletModalProvider provide a Modal in which you can select wallet you want use.
 *
 * Also you can provide a onError callback to process any error such as ConnectionError
 */
export default function Home() {
  function onError(e: WalletError) {
    if (e instanceof WalletNotFoundError) {
      toast.error(e.message);
    } else if (e instanceof WalletDisconnectedError) {
      toast.error(e.message);
    } else toast.error(e.message);
  }
  const adapters = useMemo(function () {
    const tronLinkAdapter = new TronLinkAdapter();
    const walletConnectAdapter = new WalletConnectAdapter({
      network: 'Nile',
      options: {
        relayUrl: 'wss://relay.walletconnect.com',
        // example WC app project ID
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '5fc507d8fc7ae913fff0b8071c7df231',
        metadata: {
          name: 'Tron flash transfers',
          description: 'Tron flash transfers',
          url: 'https://tron-flash-transfers.vercel.app',
          icons: ['https://tron-flash-transfers.vercel.app/globe.svg'],
        },
      },
      web3ModalConfig: {
        themeMode: 'dark',
        themeVariables: {
          '--wcm-z-index': '1000'
        },
      }
    });
    const ledger = new LedgerAdapter({
      accountNumber: 2,
    });
    const bitKeepAdapter = new BitKeepAdapter();
    const tokenPocketAdapter = new TokenPocketAdapter();
    const okxwalletAdapter = new OkxWalletAdapter();
    return [tronLinkAdapter, bitKeepAdapter, tokenPocketAdapter, okxwalletAdapter, walletConnectAdapter, ledger];
  }, []);
  return (
    <WalletProvider onError={onError} autoConnect={true} disableAutoConnectOnLoad={true} adapters={adapters}>
      <WalletModalProvider>
        <SignDemo></SignDemo>
      </WalletModalProvider>
    </WalletProvider>
  );
}

function SignDemo() {
  /* eslint-disable */
  const { signMessage, signTransaction, address } = useWallet();
  const [message, setMessage] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  const receiver = process.env.NEXT_PUBLIC_TRX_RECEIVER || 'TXw59MY9e5AtLu31si8PWrZs5kac11ThpF';
  const [open, setOpen] = useState(false);

  async function onSignMessage() {
    const res = await signMessage(message);
    setSignedMessage(res);
  }
  /* eslint-enable */

  async function onSignTransaction() {
    const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(1), address);

    const signedTransaction = await signTransaction(transaction);
    // const signedTransaction = await tronWeb.trx.sign(transaction);
    await tronWeb.trx.sendRawTransaction(signedTransaction);
    setOpen(true);
  }
  return (
    <div className="container mx-auto">
      <WalletActionButton />
      {/* <h2 className='text-xl font-bold'>Sign a message</h2>
      <p>
        You can sign a message by click the button.
      </p>
      <Button style={{ marginRight: '20px' }} onClick={onSignMessage}>
        SignMessage
      </Button>
      <TextField
        size="small"
        onChange={(e) => setMessage(e.target.value)}
        placeholder="input message to signed"
      ></TextField>
      <p>Your singedMessage is: {signedMessage}</p> */}
      <h2 className='text-xl font-bold'>Sign a Transaction</h2>
      <p>
        You can transfer 0.001 Trx to &nbsp;<i>{receiver}</i>&nbsp;by click the button.
      </p>
      <Button onClick={onSignTransaction}>Transfer</Button>
      {open && (
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%', marginTop: 1 }}>
          Success! You can confirm your transfer on{' '}
          <a target="_blank" rel="noreferrer" href={`https://nile.tronscan.org/#/address/${address}`}>
            Tron Scan
          </a>
        </Alert>
      )}
    </div>
  );
}
