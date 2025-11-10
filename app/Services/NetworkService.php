<?php
// app/Services/NetworkService.php
namespace App\Services;

class NetworkService
{
    protected $allowedNetwork;
    protected $allowedSubnet;

    public function __construct()
    {
        // Formato: 192.168.50.0/24
        $this->allowedNetwork = config('attendance.allowed_network', '192.168.50.0/24');
        $this->parseNetwork();
    }

    protected function parseNetwork()
    {
        [$network, $bits] = explode('/', $this->allowedNetwork);
        $this->allowedSubnet = [
            'network' => $network,
            'bits' => (int) $bits,
        ];
    }

    public function isInAllowedNetwork($ipAddress)
    {
        if (!filter_var($ipAddress, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return false;
        }

        $ip = ip2long($ipAddress);
        $network = ip2long($this->allowedSubnet['network']);
        $mask = -1 << (32 - $this->allowedSubnet['bits']);

        return ($ip & $mask) === ($network & $mask);
    }

    public function getNetworkInfo()
    {
        return [
            'network' => $this->allowedNetwork,
            'description' => 'Red privada de la oficina',
        ];
    }
}
