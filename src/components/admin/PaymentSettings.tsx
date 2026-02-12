import { useState, useEffect } from 'react';
import { CreditCard, Key, RefreshCw, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentConfig {
  mode: 'sandbox' | 'live';
  flutterwave_public_key: string;
  sandbox_public_key: string;
  live_public_key: string;
}

export const PaymentSettings = () => {
  const [config, setConfig] = useState<PaymentConfig>({
    mode: 'sandbox',
    flutterwave_public_key: '',
    sandbox_public_key: '',
    live_public_key: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'payment_environment')
        .single();

      if (error) throw error;

      if (data?.value) {
        const value = data.value as unknown as PaymentConfig;
        setConfig(value);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update the active public key based on mode
      const updatedConfig = {
        ...config,
        flutterwave_public_key: config.mode === 'sandbox' ? config.sandbox_public_key : config.live_public_key,
      };

      const { error } = await supabase
        .from('platform_settings')
        .update({ value: updatedConfig })
        .eq('key', 'payment_environment');

      if (error) throw error;

      setConfig(updatedConfig);
      toast({
        title: 'Settings Saved',
        description: `Payment environment set to ${config.mode.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save payment settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleMode = (checked: boolean) => {
    const newMode = checked ? 'live' : 'sandbox';
    setConfig(prev => ({
      ...prev,
      mode: newMode,
      flutterwave_public_key: newMode === 'sandbox' ? prev.sandbox_public_key : prev.live_public_key,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Gateway Settings
        </CardTitle>
        <CardDescription>
          Configure Flutterwave payment integration for your marketplace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environment Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
          <div className="space-y-1">
            <Label className="text-base font-medium">Payment Environment</Label>
            <p className="text-sm text-muted-foreground">
              Switch between sandbox (testing) and live (production) modes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={config.mode === 'sandbox' ? 'secondary' : 'outline'}>
              Sandbox
            </Badge>
            <Switch
              checked={config.mode === 'live'}
              onCheckedChange={toggleMode}
            />
            <Badge variant={config.mode === 'live' ? 'success' : 'outline'}>
              Live
            </Badge>
          </div>
        </div>

        {/* Current Status */}
        <div className={`p-4 rounded-lg border ${config.mode === 'live' ? 'border-success bg-success/10' : 'border-accent bg-accent/10'}`}>
          <div className="flex items-center gap-2">
            {config.mode === 'live' ? (
              <>
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="font-medium text-success">Live Mode Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-accent" />
                <span className="font-medium text-accent">Sandbox Mode Active</span>
              </>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {config.mode === 'live'
              ? 'Real payments are being processed. Be careful with any changes.'
              : 'Test payments only. No real money is processed.'}
          </p>
        </div>

        {/* API Keys */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sandbox-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Sandbox Public Key
            </Label>
            <Input
              id="sandbox-key"
              type="text"
              value={config.sandbox_public_key}
              onChange={(e) => setConfig(prev => ({ ...prev, sandbox_public_key: e.target.value }))}
              placeholder="FLWPUBK_TEST-..."
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Live Public Key
            </Label>
            <Input
              id="live-key"
              type="text"
              value={config.live_public_key}
              onChange={(e) => setConfig(prev => ({ ...prev, live_public_key: e.target.value }))}
              placeholder="FLWPUBK-..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Get your live keys from the Flutterwave dashboard
            </p>
          </div>
        </div>

        {/* Active Key Display */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <Label className="text-sm text-muted-foreground">Currently Active Public Key</Label>
          <p className="mt-1 font-mono text-sm break-all">
            {config.flutterwave_public_key || 'Not configured'}
          </p>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Payment Settings
            </>
          )}
        </Button>

        {/* Webhook Info */}
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <h4 className="font-medium mb-2">Webhook Configuration</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Configure this webhook URL in your Flutterwave dashboard:
          </p>
          <code className="block p-2 rounded bg-background text-xs break-all">
            https://ypwtqcehnjrikxfpvxur.supabase.co/functions/v1/flutterwave-webhook
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Secret keys are stored securely as environment variables and cannot be viewed here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
