#!/usr/bin/env bash
set -euo pipefail

echo "Starting minikube..."
minikube start --cpus=4 --memory=8g --driver=docker

echo "Enabling addons..."
minikube addons enable ingress
minikube addons enable metrics-server

echo "Adding Helm repos..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

echo "Installing kube-prometheus-stack..."
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.enabled=true \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --wait

echo "Installing loki-stack..."
helm upgrade --install loki grafana/loki-stack \
  --namespace monitoring \
  --set promtail.enabled=true \
  --wait

echo "Deploying fab-data..."
helm upgrade --install fab-data "$(dirname "$0")/../helm/fab-data" \
  --namespace default \
  --wait

echo ""
echo "Deployment complete."
echo "Run: kubectl port-forward svc/kube-prometheus-stack-grafana 3001:80 -n monitoring"
echo "Run: kubectl port-forward svc/fab-data-backend 8080:8080"
