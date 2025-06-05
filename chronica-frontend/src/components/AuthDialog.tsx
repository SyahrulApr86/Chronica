'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const { register, login, isLoading, error } = useAuthStore();
  
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    name: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData);
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerData);
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selamat datang di Chronica</DialogTitle>
          <DialogDescription>
            Login atau daftar untuk mulai mengelola jadwal Anda
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Daftar</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="loginEmailOrUsername">Email atau Username</Label>
                <Input
                  id="loginEmailOrUsername"
                  value={loginData.emailOrUsername}
                  onChange={(e) => setLoginData({ ...loginData, emailOrUsername: e.target.value })}
                  placeholder="Masukkan email atau username"
                  required
                />
              </div>

              <div>
                <Label htmlFor="loginPassword">Password</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Masukkan password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="registerEmail">Email *</Label>
                <Input
                  id="registerEmail"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="Masukkan email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="registerUsername">Username *</Label>
                <Input
                  id="registerUsername"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  placeholder="Masukkan username (min. 3 karakter)"
                  required
                  minLength={3}
                />
              </div>

              <div>
                <Label htmlFor="registerName">Nama Lengkap</Label>
                <Input
                  id="registerName"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap (opsional)"
                />
              </div>

              <div>
                <Label htmlFor="registerPassword">Password *</Label>
                <Input
                  id="registerPassword"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Masukkan password (min. 6 karakter)"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Daftar'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 